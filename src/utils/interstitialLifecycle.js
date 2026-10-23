const createInterstitialLifecycle = ({
    adInstance,
    eventTypes,
    timeoutMs = 3000,
    onLoaded,
    onClosed,
    onError,
    onTimeout,
    setTimer = setTimeout,
    clearTimer = clearTimeout,
}) => {
    let active = true;
    let settled = false;
    let timeoutId;
    const unsubscribers = [];

    const clearPendingTimeout = () => {
        if (timeoutId !== undefined) {
            clearTimer(timeoutId);
            timeoutId = undefined;
        }
    };

    const unsubscribeAll = () => {
        while (unsubscribers.length > 0) {
            const unsubscribe = unsubscribers.pop();
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        }
    };

    const dispose = () => {
        if (!active) {
            return;
        }

        active = false;
        clearPendingTimeout();
        unsubscribeAll();
    };

    unsubscribers.push(
        adInstance.addAdEventListener(eventTypes.LOADED, () => {
            if (!active || settled) {
                return;
            }

            settled = true;
            clearPendingTimeout();
            onLoaded();
        }),
        adInstance.addAdEventListener(eventTypes.CLOSED, () => {
            if (active) {
                onClosed();
            }
        }),
        adInstance.addAdEventListener(eventTypes.ERROR, (error) => {
            if (!active || settled) {
                return;
            }

            settled = true;
            clearPendingTimeout();
            onError(error);
        })
    );

    timeoutId = setTimer(() => {
        if (!active || settled) {
            return;
        }

        settled = true;
        onTimeout();
        unsubscribeAll();
    }, timeoutMs);

    try {
        adInstance.load();
    } catch (error) {
        dispose();
        throw error;
    }

    return dispose;
};

module.exports = { createInterstitialLifecycle };
