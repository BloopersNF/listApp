const { getAdUnits, IOS_DISABLED_APP_ID } = require('./src/utils/adsConfig');

module.exports = ({ config }) => {
    const ios = {
        appId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
        banner: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
        interstitial: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
    };
    const hasIosConfig = Object.values(ios).some(Boolean);
    if (hasIosConfig && !getAdUnits({ platform: 'ios', development: false, ios })) {
        throw new Error('Configure all three EXPO_PUBLIC_ADMOB_IOS_* IDs with valid iOS IDs; Android IDs cannot be reused.');
    }
    return {
        ...config,
        plugins: config.plugins.map((plugin) => {
            if (!Array.isArray(plugin) || plugin[0] !== 'react-native-google-mobile-ads') return plugin;
            // The SDK requires a native App ID even while JS monetization is disabled.
            // Google's sample iOS ID prevents a native startup crash; no iOS requests are made.
            return [plugin[0], { ...plugin[1], iosAppId: hasIosConfig ? ios.appId : IOS_DISABLED_APP_ID }];
        }),
    };
};
