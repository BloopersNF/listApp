import React, { useEffect } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';


const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-9404218606533420/6418289792';

const InterstitialAdManager = () => {
  useEffect(() => {
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribe = interstitial.onAdEvent((type) => {
      if (type === AdEventType.LOADED) {
        interstitial.show();
      } else if (type === AdEventType.CLOSED) {
        console.log('Ad closed');
      } else if (type === AdEventType.ERROR) {
        console.error('Ad failed to load');
      }
    });

    interstitial.load();

    return () => {
      unsubscribe();
    };
  }, []);

  return null; // This component does not render anything visible
};

export default InterstitialAdManager;
