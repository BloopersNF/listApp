const test = require('node:test');
const assert = require('node:assert/strict');
const { createInterstitialManager, AD_MAX_AGE_MS, AD_COOLDOWN_MS } = require('../src/utils/interstitialManager');
const events = Object.fromEntries(['LOADED', 'ERROR', 'OPENED', 'CLOSED', 'PAID'].map((name) => [name, name]));
const tick = () => new Promise(setImmediate);
const harness = () => {
    let time = 1000000;
    const ads = [], timers = new Map(), logs = [];
    let timerId = 0;
    const manager = createInterstitialManager({ events, now: () => time, random: () => 0,
        record: (name, fields) => logs.push({ name, ...fields }),
        setTimer: (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; },
        clearTimer: (id) => timers.delete(id),
        createAd: () => {
            const listeners = new Map();
            const ad = { shows: 0, loads: 0, listeners,
                addAdEventListener: (type, callback) => { listeners.set(type, callback); return () => listeners.delete(type); },
                load: () => { ad.loads++; },
                show: () => { ad.shows++; return Promise.resolve(); },
                emit: (type, data) => listeners.get(type)?.(data),
            };
            ads.push(ad);
            return ad;
        },
    });
    manager.setEnabled(true);
    return { manager, ads, timers, logs, advance: (ms) => { time += ms; },
        retry: () => { const [id, timer] = timers.entries().next().value; timers.delete(id); time += timer.delay; timer.callback(); } };
};

test('preloads once, retains slow loads, and never shows on LOADED', () => {
    const h = harness();
    h.manager.setOpportunityExpected(true);
    h.manager.preload();
    h.advance(12000);
    h.ads[0].emit(events.LOADED);
    assert.equal(h.ads.length, 1);
    assert.equal(h.ads[0].shows, 0);
    assert.equal(h.manager.canShow(), true);
});

test('a missed opportunity continues immediately and later load cannot show retroactively', () => {
    const h = harness();
    h.manager.setOpportunityExpected(true);
    assert.equal(h.manager.tryShow(), false);
    h.manager.setOpportunityExpected(false);
    h.ads[0].emit(events.LOADED);
    assert.equal(h.ads[0].shows, 0);
});

test('background cannot show or retry, and a late load is only cached', () => {
    const h = harness();
    h.manager.setOpportunityExpected(true);
    h.manager.setForeground(false);
    h.ads[0].emit(events.LOADED);
    assert.equal(h.manager.tryShow(), false);
    assert.equal(h.ads[0].shows, 0);
    h.manager.setForeground(true);
    assert.equal(h.manager.canShow(), true);
});

test('closing an opened ad resumes navigation once and enforces the whole-session cap', async () => {
    const h = harness();
    let resumed = 0;
    h.manager.setOpportunityExpected(true);
    const ad = h.ads[0];
    ad.emit(events.LOADED);
    assert.equal(h.manager.tryShow({ onFinished: () => resumed++ }), true);
    assert.equal(h.manager.tryShow(), false);
    ad.emit(events.OPENED);
    ad.emit(events.CLOSED);
    ad.emit(events.CLOSED);
    await tick();
    h.advance(AD_COOLDOWN_MS + 1);
    h.manager.preload();
    assert.equal(resumed, 1);
    assert.equal(h.manager.canShow(), false);
    assert.equal(h.ads.length, 1);
});

test('persisted cooldown survives restart and prevents even preloading until eligible', () => {
    const h = harness();
    h.manager.restoreLastShownAt(1000000);
    h.manager.setOpportunityExpected(true);
    assert.equal(h.ads.length, 0);
    h.advance(AD_COOLDOWN_MS);
    h.manager.preload();
    assert.equal(h.ads.length, 1);
});

test('expired inventory is not shown and gets replaced on a later opportunity', () => {
    const h = harness();
    h.manager.setOpportunityExpected(true);
    h.ads[0].emit(events.LOADED);
    h.advance(AD_MAX_AGE_MS);
    assert.equal(h.manager.tryShow(), false);
    h.manager.preload();
    assert.equal(h.ads.length, 2);
    assert.equal(h.ads[0].listeners.size, 0);
});

test('no-fill uses bounded backoff, canceled when the screen loses focus', () => {
    const h = harness();
    h.manager.setOpportunityExpected(true);
    h.ads[0].emit(events.ERROR, { code: 'googleMobileAds/no-fill' });
    assert.equal(h.timers.values().next().value.delay, 30000);
    h.manager.setOpportunityExpected(false);
    assert.equal(h.timers.size, 0);
    h.manager.setOpportunityExpected(true);
    assert.equal(h.ads.length, 1);
    h.retry();
    h.ads[1].emit(events.ERROR, { code: 'network-error' });
    assert.equal(h.timers.values().next().value.delay, 60000);
    h.retry();
    h.ads[2].emit(events.ERROR, { code: 'no-fill' });
    h.retry();
    h.ads[3].emit(events.ERROR, { code: 'no-fill' });
    h.manager.preload();
    assert.equal(h.ads.length, 4);
    assert.equal(h.timers.size, 0);
});

test('invalid configuration is not retried in a loop', () => {
    const h = harness();
    h.manager.setOpportunityExpected(true);
    h.ads[0].emit(events.ERROR, { code: 'googleMobileAds/invalid-request' });
    h.manager.preload();
    assert.equal(h.ads.length, 1);
    assert.equal(h.timers.size, 0);
});

test('consent change invalidates cached inventory and ignores stale native callbacks', () => {
    const h = harness();
    h.manager.setOpportunityExpected(true);
    const lateLoaded = h.ads[0].listeners.get(events.LOADED);
    h.manager.setEnabled(false);
    lateLoaded();
    assert.equal(h.manager.canShow(), false);
    assert.equal(h.ads[0].listeners.size, 0);
    h.manager.setEnabled(true);
    assert.equal(h.ads.length, 2);
});

test('show errors after LOADED release navigation and listeners', async () => {
    for (const rejectPromise of [false, true]) {
        const h = harness();
        let resumed = 0;
        h.manager.setOpportunityExpected(true);
        const ad = h.ads[0];
        ad.emit(events.LOADED);
        if (rejectPromise) ad.show = () => Promise.reject(new Error('activity unavailable'));
        h.manager.tryShow({ onFinished: () => resumed++ });
        if (!rejectPromise) ad.emit(events.ERROR, { code: 'show-failed' });
        await tick();
        assert.equal(resumed, 1);
        assert.equal(ad.listeners.size, 0);
    }
});
