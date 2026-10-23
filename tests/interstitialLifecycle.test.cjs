const test = require('node:test');
const assert = require('node:assert/strict');
const { createInterstitialLifecycle } = require('../src/utils/interstitialLifecycle');

const EVENT_TYPES = {
    LOADED: 'loaded',
    CLOSED: 'closed',
    ERROR: 'error',
};

const createHarness = () => {
    const listeners = new Map();
    const unsubscribedEvents = [];
    const clearedTimers = [];
    let timerCallback;
    let showCount = 0;

    const adInstance = {
        addAdEventListener(eventType, listener) {
            listeners.set(eventType, listener);
            return () => {
                listeners.delete(eventType);
                unsubscribedEvents.push(eventType);
            };
        },
        load() {},
        show() {
            showCount += 1;
            return Promise.resolve();
        },
    };

    const dispose = createInterstitialLifecycle({
        adInstance,
        eventTypes: EVENT_TYPES,
        onLoaded: () => adInstance.show(),
        onClosed: () => {},
        onError: () => {},
        onTimeout: () => {},
        setTimer: (callback) => {
            timerCallback = callback;
            return 42;
        },
        clearTimer: (timerId) => clearedTimers.push(timerId),
    });

    return {
        clearedTimers,
        dispose,
        emit: (eventType, value) => listeners.get(eventType)?.(value),
        expire: () => timerCallback(),
        getShowCount: () => showCount,
        listeners,
        unsubscribedEvents,
    };
};

test('cancels listeners and prevents a late ad after screen blur', () => {
    const harness = createHarness();

    harness.dispose();
    harness.emit(EVENT_TYPES.LOADED);

    assert.equal(harness.getShowCount(), 0);
    assert.equal(harness.listeners.size, 0);
    assert.deepEqual(new Set(harness.unsubscribedEvents), new Set(Object.values(EVENT_TYPES)));
    assert.deepEqual(harness.clearedTimers, [42]);
});

test('unsubscribes on timeout so a late loaded event cannot show an ad', () => {
    const harness = createHarness();
    const loadedListener = harness.listeners.get(EVENT_TYPES.LOADED);

    harness.expire();
    loadedListener();

    assert.equal(harness.getShowCount(), 0);
    assert.equal(harness.listeners.size, 0);
});

test('shows at most once when loaded before the timeout', () => {
    const harness = createHarness();

    harness.emit(EVENT_TYPES.LOADED);
    harness.expire();
    harness.emit(EVENT_TYPES.LOADED);

    assert.equal(harness.getShowCount(), 1);
    assert.deepEqual(harness.clearedTimers, [42]);
});

test('settles an ad error without showing and clears the timeout', () => {
    const harness = createHarness();

    harness.emit(EVENT_TYPES.ERROR, new Error('network unavailable'));
    harness.expire();

    assert.equal(harness.getShowCount(), 0);
    assert.deepEqual(harness.clearedTimers, [42]);
});
