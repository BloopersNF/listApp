const ANDROID_APP_ID = 'ca-app-pub-9404218606533420~5307626712';
const IOS_DISABLED_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
const ANDROID_UNITS = Object.freeze({
    banner: 'ca-app-pub-9404218606533420/2553683512',
    interstitial: 'ca-app-pub-9404218606533420/6418289792',
});

const getAdUnits = ({ platform, development, testIds, ios = {} }) => {
    if (platform === 'web') return null;
    // iOS remains disabled until its own app and both units have been configured.
    if (platform === 'ios' && (!ios.appId || ios.appId === ANDROID_APP_ID || ios.appId === IOS_DISABLED_APP_ID ||
        !/^ca-app-pub-\d{16}~\d{10}$/.test(ios.appId) ||
        !/^ca-app-pub-\d{16}\/\d{10}$/.test(ios.banner || '') ||
        !/^ca-app-pub-\d{16}\/\d{10}$/.test(ios.interstitial || '') ||
        Object.values(ANDROID_UNITS).some((id) => id === ios.banner || id === ios.interstitial))) {
        return null;
    }
    if (platform !== 'android' && platform !== 'ios') return null;
    if (development) return { banner: testIds.BANNER, interstitial: testIds.INTERSTITIAL };
    return platform === 'android' ? ANDROID_UNITS : { banner: ios.banner, interstitial: ios.interstitial };
};

module.exports = { ANDROID_APP_ID, IOS_DISABLED_APP_ID, ANDROID_UNITS, getAdUnits };
