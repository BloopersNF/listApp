const ADS_DIAGNOSTICS_KEY = 'adsDiagnostics';
const MAX_EVENTS = 80;
const FIELDS = new Set(['format', 'placement', 'reason', 'code', 'durationMs', 'value', 'currency', 'precision']);

const classifyAdError = (error) => {
    const code = String(error?.code ?? 'unknown');
    if (/no[-_ ]?fill|(?:^|\/)3$/.test(code)) return 'no-fill';
    if (/network|(?:^|\/)2$/.test(code)) return 'network';
    if (/invalid|app-id|(?:^|\/)1$/.test(code)) return 'configuration';
    return 'other';
};

// Device-local operational counters only. Never record list contents, IDs or SDK messages.
const createAdDiagnostics = ({ storage, now = Date.now }) => {
    let state = { version: 1, counters: {}, revenue: {}, events: [] };
    let queue = Promise.resolve().then(async () => {
        try {
            const stored = JSON.parse(await storage.getItem(ADS_DIAGNOSTICS_KEY));
            if (stored?.version === 1 && Array.isArray(stored.events)) {
                state = { ...state, ...stored, events: stored.events.slice(-MAX_EVENTS) };
            }
        } catch { /* Diagnostics must never prevent the app from working. */ }
    });

    const record = (name, details = {}) => {
        const fields = {};
        for (const [key, value] of Object.entries(details)) {
            if (FIELDS.has(key) && (typeof value === 'string' || Number.isFinite(value))) {
                fields[key] = typeof value === 'string' ? value.slice(0, 100) : value;
            }
        }
        const timestamp = now();
        queue = queue.then(async () => {
            const counter = `${fields.format || 'sdk'}:${name}`;
            state.counters[counter] = (state.counters[counter] || 0) + 1;
            if (name === 'paid' && /^[A-Z]{3}$/.test(fields.currency || '') && fields.value >= 0) {
                state.revenue[fields.currency] = (state.revenue[fields.currency] || 0) + fields.value;
            }
            state.events = [...state.events, { name, timestamp, ...fields }].slice(-MAX_EVENTS);
            try { await storage.setItem(ADS_DIAGNOSTICS_KEY, JSON.stringify(state)); } catch { /* Best effort. */ }
        }).catch(() => {});
    };

    const getSnapshot = async () => {
        await queue;
        return JSON.parse(JSON.stringify(state));
    };
    return { record, getSnapshot };
};

module.exports = { ADS_DIAGNOSTICS_KEY, createAdDiagnostics, classifyAdError };
