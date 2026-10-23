const { classifyAdError } = require('./adDiagnostics');

const AD_COOLDOWN_MS = 5 * 60 * 1000;
const AD_MAX_AGE_MS = 55 * 60 * 1000;
const RETRY_DELAYS = [30000, 60000, 120000];

const createInterstitialManager = ({ createAd, events, record = () => {}, onOpened = () => {},
    now = Date.now, random = Math.random, setTimer = setTimeout, clearTimer = clearTimeout }) => {
    let enabled = false;
    let foreground = true;
    let expected = false;
    let current;
    let retryTimer;
    let failures = 0;
    let retryAt = 0;
    let configurationFailed = false;
    let shownThisSession = false;
    let lastShownAt = null;

    const track = (name, fields = {}) => record(name, { format: 'interstitial', ...fields });
    const clearRetry = () => { if (retryTimer !== undefined) clearTimer(retryTimer); retryTimer = undefined; };
    const policyAllows = () => !shownThisSession && (lastShownAt === null || now() - lastShownAt >= AD_COOLDOWN_MS);
    const disposeAd = () => {
        const old = current;
        current = undefined;
        old?.unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
    const finish = (entry, reason) => {
        if (current !== entry) return;
        const callback = entry.onFinished;
        disposeAd();
        track(reason);
        if (callback) Promise.resolve().then(callback);
    };
    const scheduleRetry = () => {
        clearRetry();
        if (!enabled || !foreground || !expected || !policyAllows() || configurationFailed || failures > RETRY_DELAYS.length) return;
        retryTimer = setTimer(() => { retryTimer = undefined; preload(); }, Math.max(0, retryAt - now()));
    };

    const preload = () => {
        if (current?.status === 'loaded' && now() - current.loadedAt >= AD_MAX_AGE_MS) {
            track('expired');
            disposeAd();
        }
        if (!enabled || !foreground || !expected || !policyAllows() || configurationFailed || current || failures > RETRY_DELAYS.length) return;
        if (now() < retryAt) { scheduleRetry(); return; }
        clearRetry();
        const entry = { status: 'loading', unsubscribers: [], startedAt: now() };
        current = entry;
        const fail = (error) => {
            if (current !== entry) return;
            const reason = classifyAdError(error);
            track(entry.status === 'showing' ? 'show_failed' : 'load_failed', { reason, code: String(error?.code || 'unknown') });
            if (entry.status === 'showing') { finish(entry, 'show_finished'); return; }
            disposeAd();
            failures += 1;
            configurationFailed = reason === 'configuration';
            if (failures <= RETRY_DELAYS.length) {
                retryAt = now() + RETRY_DELAYS[failures - 1] * (1 + random() * 0.2);
                scheduleRetry();
            }
        };
        try {
            entry.ad = createAd();
            entry.unsubscribers.push(
                entry.ad.addAdEventListener(events.LOADED, () => {
                    if (current !== entry || entry.status !== 'loading') return;
                    entry.status = 'loaded';
                    entry.loadedAt = now();
                    failures = 0;
                    track('loaded', { durationMs: now() - entry.startedAt });
                }),
                entry.ad.addAdEventListener(events.ERROR, fail),
                entry.ad.addAdEventListener(events.OPENED, () => {
                    if (current !== entry || entry.status !== 'showing' || entry.opened) return;
                    entry.opened = true;
                    shownThisSession = true;
                    lastShownAt = now();
                    track('opened');
                    onOpened(lastShownAt);
                }),
                entry.ad.addAdEventListener(events.CLOSED, () => finish(entry, 'closed')),
                entry.ad.addAdEventListener(events.PAID, (event) => {
                    if (current === entry) track('paid', event);
                })
            );
            track('load_started');
            entry.ad.load();
        } catch (error) { fail(error); }
    };

    const canShow = () => enabled && foreground && policyAllows() && current?.status === 'loaded' && now() - current.loadedAt < AD_MAX_AGE_MS;
    const tryShow = ({ onFinished, placement = 'completed_list_exit' } = {}) => {
        track('opportunity', { placement });
        if (!canShow()) { track('skipped', { placement, reason: 'not_ready_or_capped' }); return false; }
        const entry = current;
        entry.status = 'showing';
        entry.onFinished = onFinished;
        clearRetry();
        track('show_requested', { placement });
        try {
            Promise.resolve(entry.ad.show()).catch((error) => {
                if (current !== entry) return;
                track('show_failed', { code: String(error?.code || 'unknown') });
                finish(entry, 'show_finished');
            });
        } catch (error) {
            track('show_failed', { code: String(error?.code || 'unknown') });
            finish(entry, 'show_finished');
        }
        return true;
    };

    return {
        preload, canShow, tryShow,
        restoreLastShownAt: (value) => { if (Number.isFinite(value) && value > 0) lastShownAt = value; },
        setEnabled: (value) => {
            enabled = value;
            if (!enabled) {
                clearRetry();
                if (current?.status === 'showing') finish(current, 'interrupted'); else disposeAd();
            } else preload();
        },
        setForeground: (value) => { foreground = value; if (!value) clearRetry(); else preload(); },
        setOpportunityExpected: (value) => { expected = value; if (value) preload(); else clearRetry(); },
    };
};

module.exports = { createInterstitialManager, AD_COOLDOWN_MS, AD_MAX_AGE_MS };
