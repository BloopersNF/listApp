import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import StackScreen from './src/screens/stackScreen';
import { getApps, initializeApp } from 'firebase/app';
import { AdsProvider } from './src/context/AdsContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import ReviewReminder from './src/components/ReviewReminder';
import * as SplashScreen from 'expo-splash-screen';
import 'expo-dev-client';
import './src/i18n';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const firebaseConfig = {
  apiKey: "AIzaSyAOflUm0k7St1uYqMZo9ldmOpJJLGOr7b0",
  authDomain: "listapp-ce96d.firebaseapp.com",
  projectId: "listapp-ce96d",
  storageBucket: "listapp-ce96d.appspot.com",
  messagingSenderId: "484016225747",
  appId: "1:484016225747:web:fb59665bf64ed883a84326",
  measurementId: "G-H73KM7KX6R"
};
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const App = () => {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <LanguageProvider>
        <ThemeProvider>
          <AdsProvider>
            <ReviewReminder />
            <View style={styles.container} onLayout={onLayoutRootView}>
              <NavigationContainer>
                <StackScreen />
              </NavigationContainer>
            </View>
          </AdsProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
