const createInterstitialStub = () => ({
  addAdEventListener: () => () => {},
  load: () => {},
  onAdEvent: () => () => {},
  show: async () => {},
});

const mobileAds = () => ({
  initialize: async () => [],
});

export const AdEventType = {
  CLOSED: 'closed',
  ERROR: 'error',
  LOADED: 'loaded',
};

export const BannerAd = () => null;
export const BannerAdSize = { ANCHORED_ADAPTIVE_BANNER: 'adaptiveBanner' };
export const InterstitialAd = { createForAdRequest: createInterstitialStub };
export const TestIds = {
  BANNER: 'test-banner',
  INTERSTITIAL: 'test-interstitial',
};

export default mobileAds;
