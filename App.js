import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackScreen from './src/screens/stackScreen';
import firebase from 'firebase/compat/app';
import mobileAds from 'react-native-google-mobile-ads';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import CustomSplashScreen from './src/components/CustomSplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import 'expo-dev-client';

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Inicializar o Google Mobile Ads SDK
        await mobileAds().initialize();
        console.log('AdMob initialized');
        
        // Pre-load fonts, make any API calls you need to do here
        // Simulate app loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <LanguageProvider>
        <ThemeProvider>
          <CustomSplashScreen />
        </ThemeProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <StackScreen/>
          </NavigationContainer>
        </View>
      </ThemeProvider>
    </LanguageProvider>
  );
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
