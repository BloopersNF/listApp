import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from '../utils/mobileAds';

const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-9404218606533420/2553683512';

const AdBanner = () => {
  // Verificar se AdMob está habilitado globalmente
  if (!global.AdMobEnabled) {
    console.log('AdBanner: AdMob desabilitado, não mostrando banner');
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Garante que o banner ocupe toda a largura da tela
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: Platform.OS === 'ios' ? 8 : 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default AdBanner;
