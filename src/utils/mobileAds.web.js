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
  OPENED: 'opened',
  PAID: 'paid',
};

export const AdsConsentPrivacyOptionsRequirementStatus = { REQUIRED: 'REQUIRED' };
export const AdsConsent = {
  requestInfoUpdate: async () => ({ canRequestAds: false }),
  loadAndShowConsentFormIfRequired: async () => ({ canRequestAds: false }),
  getConsentInfo: async () => ({ canRequestAds: false }),
  showPrivacyOptionsForm: async () => ({ canRequestAds: false }),
};

export const BannerAd = () => null;
export const BannerAdSize = { ANCHORED_ADAPTIVE_BANNER: 'adaptiveBanner' };
export const InterstitialAd = { createForAdRequest: createInterstitialStub };
export const TestIds = {
  BANNER: 'test-banner',
  INTERSTITIAL: 'test-interstitial',
};

export default mobileAds;
