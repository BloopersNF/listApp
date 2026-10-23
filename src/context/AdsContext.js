import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds, { AdsConsent, AdEventType, InterstitialAd, TestIds } from '../utils/mobileAds';
import { getAdUnits } from '../utils/adsConfig';
import { createAdDiagnostics } from '../utils/adDiagnostics';
import { createAdsRuntime } from '../utils/adsRuntime';
import { createInterstitialManager } from '../utils/interstitialManager';

const FREQUENCY_KEY = 'adsFrequencyState';
// UMP passes the user's consent signals to the SDK; do not override them with a global NPA flag.
const REQUEST_OPTIONS = Object.freeze({});
const units = getAdUnits({
    platform: Platform.OS,
    development: __DEV__,
    testIds: TestIds,
    ios: {
        appId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
        banner: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
        interstitial: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
    },
});

const diagnostics = createAdDiagnostics({ storage: AsyncStorage });
export const recordAdEvent = diagnostics.record;
export const getAdDiagnostics = diagnostics.getSnapshot;
export const interstitialManager = createInterstitialManager({
    createAd: () => InterstitialAd.createForAdRequest(units.interstitial, REQUEST_OPTIONS),
    events: AdEventType,
    record: recordAdEvent,
    onOpened: (lastShownAt) => {
        AsyncStorage.setItem(FREQUENCY_KEY, JSON.stringify({ lastShownAt })).catch(() => {});
    },
});
const runtime = createAdsRuntime({
    enabled: !!units,
    consent: AdsConsent,
    initialize: () => mobileAds().initialize(),
    record: recordAdEvent,
});
runtime.subscribe(() => interstitialManager.setEnabled(runtime.getSnapshot().ready));
const AdsContext = createContext(null);
let bootstrap;
const startAds = () => {
    if (!bootstrap) {
        bootstrap = Promise.resolve().then(async () => {
            try {
                const stored = JSON.parse(await AsyncStorage.getItem(FREQUENCY_KEY));
                interstitialManager.restoreLastShownAt(stored?.lastShownAt);
            } catch { /* Frequency state is best effort; the session cap still applies. */ }
            await runtime.start();
        });
    }
    return bootstrap;
};

export const AdsProvider = ({ children }) => {
    const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
    const [foreground, setForeground] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');

    useEffect(() => {
        let lastRetryAt = 0;
        const updateForeground = (nextState) => {
            const active = nextState === 'active';
            runtime.setForeground(active);
            interstitialManager.setForeground(active);
            setForeground(active);
            // Recover a failed initialization on a later foreground transition, without polling.
            const current = runtime.getSnapshot();
            const recoverable = current.status === 'error' || (current.status === 'blocked' && current.consentError);
            if (active && recoverable && Date.now() - lastRetryAt > 30000) {
                lastRetryAt = Date.now();
                runtime.start();
            }
        };
        runtime.setForeground(foreground);
        interstitialManager.setForeground(foreground);
        startAds();
        const subscription = AppState.addEventListener('change', updateForeground);
        return () => {
            subscription.remove();
            interstitialManager.setOpportunityExpected(false);
        };
    }, []);

    const value = useMemo(() => ({
        ...state,
        foreground,
        bannerUnitId: units?.banner,
        requestOptions: REQUEST_OPTIONS,
        showPrivacyOptions: runtime.showPrivacyOptions,
        isPrivacyFlowActive: () => runtime.getSnapshot().busy || runtime.getSnapshot().status === 'idle',
        recordAdEvent,
        getAdDiagnostics,
        interstitial: interstitialManager,
    }), [state, foreground]);

    return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
};

export const useAds = () => {
    const context = useContext(AdsContext);
    if (!context) throw new Error('useAds must be used inside AdsProvider');
    return context;
};
