import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from '../utils/mobileAds';
import { useAds } from '../context/AdsContext';
import { useTheme } from '../context/ThemeContext';
import { classifyAdError } from '../utils/adDiagnostics';

const AdBanner = () => {
  const { ready, foreground, bannerUnitId, requestOptions, consentRevision, recordAdEvent } = useAds();
  const { colors } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!ready) setMounted(false);
    else if (foreground) setMounted(true);
  }, [ready, foreground]);
  if (!ready || !mounted || !bannerUnitId) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }, !foreground && styles.hidden]}>
      <BannerAd
        key={consentRevision}
        unitId={bannerUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={requestOptions}
        onAdLoaded={() => {
          recordAdEvent('loaded', { format: 'banner' });
        }}
        onAdFailedToLoad={(error) => {
          recordAdEvent('load_failed', { format: 'banner', code: String(error?.code || 'unknown'), reason: classifyAdError(error) });
        }}
        onAdImpression={() => recordAdEvent('impression', { format: 'banner' })}
        onPaid={(event) => recordAdEvent('paid', { format: 'banner', ...event })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: { display: 'none' },
  container: {
    width: '100%', // Garante que o banner ocupe toda a largura da tela
    minHeight: Platform.OS === 'ios' ? 66 : 60,
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
