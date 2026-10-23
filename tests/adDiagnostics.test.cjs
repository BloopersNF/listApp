const test = require('node:test');
const assert = require('node:assert/strict');
const { createAdDiagnostics, classifyAdError } = require('../src/utils/adDiagnostics');
const { getAdUnits, ANDROID_APP_ID, ANDROID_UNITS } = require('../src/utils/adsConfig');

test('diagnostics survive restart, remain bounded, and omit list content and raw SDK messages', async () => {
    let saved = null;
    const storage = { getItem: async () => saved, setItem: async (key, value) => { saved = value; } };
    const diagnostics = createAdDiagnostics({ storage });
    for (let i = 0; i < 100; i++) diagnostics.record('loaded', { format: 'banner', listName: 'private groceries', message: 'private error' });
    diagnostics.record('paid', { format: 'banner', value: 0.001, currency: 'USD', precision: 1 });
    await diagnostics.getSnapshot();
    const reloaded = await createAdDiagnostics({ storage }).getSnapshot();
    assert.equal(reloaded.events.length, 80);
    assert.equal(reloaded.counters['banner:loaded'], 100);
    assert.equal(reloaded.revenue.USD, 0.001);
    assert.ok(!saved.includes('private'));
});

test('unavailable storage does not break diagnostics or the ad lifecycle', async () => {
    const diagnostics = createAdDiagnostics({ storage: { getItem: async () => { throw Error(); }, setItem: async () => { throw Error(); } } });
    diagnostics.record('loaded');
    assert.equal((await diagnostics.getSnapshot()).events.length, 1);
});

test('classifies native and bridge errors separately', () => {
    assert.equal(classifyAdError({ code: 'googleMobileAds/no-fill' }), 'no-fill');
    assert.equal(classifyAdError({ code: 'error-code-network-error' }), 'network');
    assert.equal(classifyAdError({ code: 'invalid-request' }), 'configuration');
});

test('Android production and test units are separate; web and unconfigured iOS are disabled', () => {
    const testIds = { BANNER: 'test-banner', INTERSTITIAL: 'test-interstitial' };
    assert.deepEqual(getAdUnits({ platform: 'android', development: false }), ANDROID_UNITS);
    assert.deepEqual(getAdUnits({ platform: 'android', development: true, testIds }), { banner: 'test-banner', interstitial: 'test-interstitial' });
    assert.equal(getAdUnits({ platform: 'web' }), null);
    assert.equal(getAdUnits({ platform: 'ios', development: true, testIds }), null);
    assert.equal(getAdUnits({ platform: 'ios', ios: { appId: ANDROID_APP_ID, ...ANDROID_UNITS } }), null);
});
