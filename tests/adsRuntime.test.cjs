const test = require('node:test');
const assert = require('node:assert/strict');
const { createAdsRuntime } = require('../src/utils/adsRuntime');
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const allowed = { canRequestAds: true, privacyOptionsRequirementStatus: 'REQUIRED' };
const tick = () => new Promise(setImmediate);
const harness = (overrides = {}) => {
    const calls = [];
    const consent = {
        requestInfoUpdate: async () => { calls.push('update'); return allowed; },
        loadAndShowConsentFormIfRequired: async () => { calls.push('form'); return allowed; },
        getConsentInfo: async () => allowed,
        showPrivacyOptionsForm: async () => allowed,
        ...overrides.consent,
    };
    const runtime = createAdsRuntime({ enabled: true, consent,
        initialize: overrides.initialize || (async () => { calls.push('initialize'); }),
        ...overrides, consent });
    return { runtime, calls };
};

test('consent precedes initialization and concurrent mounts share a single operation', async () => {
    const { runtime, calls } = harness();
    await Promise.all([runtime.start(), runtime.start()]);
    await runtime.start();
    assert.deepEqual(calls, ['update', 'form', 'initialize']);
    assert.equal(runtime.getSnapshot().ready, true);
    assert.equal(runtime.getSnapshot().privacyOptionsRequired, true);
});

test('slow initialization remains pending instead of disabling ads at three seconds', async () => {
    const gate = deferred();
    let time = 0;
    const { runtime } = harness({ now: () => time, initialize: () => gate.promise });
    const pending = runtime.start();
    await tick();
    time = 12000;
    assert.equal(runtime.getSnapshot().status, 'initializing');
    gate.resolve();
    await pending;
    assert.equal(runtime.getSnapshot().ready, true);
});

test('no consent eligibility means no SDK initialization', async () => {
    const { runtime, calls } = harness({ consent: { loadAndShowConsentFormIfRequired: async () => ({ canRequestAds: false }) } });
    await runtime.start();
    assert.equal(runtime.getSnapshot().status, 'blocked');
    assert.ok(!calls.includes('initialize'));
});

test('UMP errors use SDK eligibility, including a denial, without inventing consent', async () => {
    for (const canRequestAds of [true, false]) {
        const { runtime, calls } = harness({ consent: {
            requestInfoUpdate: async () => { throw new Error('offline'); },
            getConsentInfo: async () => ({ canRequestAds }),
        } });
        await runtime.start();
        assert.equal(runtime.getSnapshot().ready, canRequestAds);
        assert.equal(calls.includes('initialize'), canRequestAds);
    }
});

test('changing privacy choices disables inventory immediately and rechecks eligibility', async () => {
    const gate = deferred();
    const { runtime, calls } = harness({ consent: { showPrivacyOptionsForm: () => gate.promise } });
    await runtime.start();
    const revision = runtime.getSnapshot().consentRevision;
    const pending = runtime.showPrivacyOptions();
    assert.equal(runtime.getSnapshot().ready, false);
    assert.equal(runtime.getSnapshot().busy, true);
    gate.resolve({ canRequestAds: false, privacyOptionsRequirementStatus: 'REQUIRED' });
    await pending;
    assert.equal(runtime.getSnapshot().ready, false);
    assert.equal(runtime.getSnapshot().consentRevision, revision + 1);
    assert.equal(calls.filter((call) => call === 'initialize').length, 1);
});

test('a consent form waits for foreground instead of presenting in background', async () => {
    const info = deferred();
    const { runtime, calls } = harness({ consent: { requestInfoUpdate: () => info.promise } });
    const pending = runtime.start();
    await tick();
    runtime.setForeground(false);
    info.resolve(allowed);
    await tick();
    assert.ok(!calls.includes('form'));
    runtime.setForeground(true);
    await pending;
    assert.deepEqual(calls, ['form', 'initialize']);
});

test('disabled platforms do not call native consent or initialization', async () => {
    const { runtime, calls } = harness({ enabled: false });
    await runtime.start();
    assert.equal(runtime.getSnapshot().status, 'disabled');
    assert.deepEqual(calls, []);
});

test('an actual SDK error can recover on a later explicit start', async () => {
    let attempts = 0;
    const { runtime } = harness({ initialize: async () => { if (++attempts === 1) throw new Error('unavailable'); } });
    await runtime.start();
    assert.equal(runtime.getSnapshot().status, 'error');
    await runtime.start();
    assert.equal(runtime.getSnapshot().ready, true);
    assert.equal(attempts, 2);
});

test('an offline first consent request can recover later without retrying a genuine denial', async () => {
    let attempts = 0;
    const { runtime } = harness({ consent: {
        requestInfoUpdate: async () => { if (++attempts === 1) throw new Error('offline'); },
        getConsentInfo: async () => ({ canRequestAds: false }),
    } });
    await runtime.start();
    assert.equal(runtime.getSnapshot().ready, false);
    await runtime.start();
    assert.equal(runtime.getSnapshot().ready, true);
    assert.equal(attempts, 2);
});
