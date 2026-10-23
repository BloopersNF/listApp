const createAdsRuntime = ({ enabled, consent, initialize, record = () => {}, now = Date.now }) => {
    let state = { status: enabled ? 'idle' : 'disabled', ready: false,
        privacyOptionsRequired: false, consentRevision: 0, busy: false, consentError: false };
    let operation;
    let initialized = false;
    let active = true;
    const activeWaiters = new Set();
    const subscribers = new Set();
    const update = (patch) => {
        state = { ...state, ...patch };
        subscribers.forEach((listener) => listener());
    };
    const waitForForeground = () => active ? Promise.resolve() : new Promise((resolve) => activeWaiters.add(resolve));

    const applyConsent = async (info) => {
        update({ privacyOptionsRequired: info?.privacyOptionsRequirementStatus === 'REQUIRED' });
        if (!info?.canRequestAds) {
            update({ status: 'blocked', ready: false });
            record('consent_blocked');
            return;
        }
        if (!initialized) {
            await waitForForeground();
            update({ status: 'initializing' });
            const startedAt = now();
            record('initialization_started');
            await initialize();
            initialized = true;
            record('initialization_completed', { durationMs: now() - startedAt });
        }
        update({ status: 'ready', ready: true });
    };

    const run = (privacyOptions) => {
        if (!enabled) return Promise.resolve(state);
        if (operation) return operation;
        if (!privacyOptions && (state.status === 'ready' || (state.status === 'blocked' && !state.consentError))) return Promise.resolve(state);
        // Invalidate cached inventory and mounted banners before changing consent.
        update({ ready: false, busy: true, status: 'consenting', consentError: false, consentRevision: state.consentRevision + 1 });
        operation = Promise.resolve().then(async () => {
            let info;
            try {
                await waitForForeground();
                if (privacyOptions) {
                    info = await consent.showPrivacyOptionsForm();
                } else {
                    await consent.requestInfoUpdate();
                    await waitForForeground();
                    info = await consent.loadAndShowConsentFormIfRequired();
                }
            } catch (error) {
                record('consent_error', { code: String(error?.code || 'unknown') });
                update({ consentError: true });
                // UMP may still allow requests using the previously gathered consent.
                info = await consent.getConsentInfo();
            }
            await applyConsent(info);
        }).catch((error) => {
            record(state.status === 'initializing' ? 'initialization_failed' : 'startup_failed', { code: String(error?.code ?? 'unknown') });
            update({ status: 'error', ready: false });
        }).finally(() => {
            update({ busy: false });
            operation = undefined;
        }).then(() => state);
        return operation;
    };

    return {
        getSnapshot: () => state,
        subscribe: (listener) => { subscribers.add(listener); return () => subscribers.delete(listener); },
        start: () => run(false),
        showPrivacyOptions: () => run(true),
        setForeground: (value) => {
            active = value;
            if (active) { activeWaiters.forEach((resolve) => resolve()); activeWaiters.clear(); }
        },
    };
};

module.exports = { createAdsRuntime };
