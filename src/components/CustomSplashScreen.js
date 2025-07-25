import React from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomSplashScreen = () => {
  const { colors } = useTheme();
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, []);

  const rotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: '#4A90E2' }]}>
      {/* Logo/Icon Area */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/Icon.png')} 
          style={styles.appIcon}
          resizeMode="contain"
        />
      </View>

      {/* App Name */}
      <Text style={styles.appName}>MarketList</Text>
      <Text style={styles.subtitle}>Organize suas listas</Text>

      {/* Loading Indicator */}
      <Animated.View style={[styles.loadingContainer, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.loadingRing} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  appIcon: {
    width: 200,
    height: 200,
    borderRadius: 30,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 60,
    textAlign: 'center',
  },
  loadingContainer: {
    width: 40,
    height: 40,
  },
  loadingRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
  },
});

export default CustomSplashScreen;
