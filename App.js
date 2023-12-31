import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './src/screens/mainScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const App = () => {
  return (
    <NavigationContainer>
      <MainScreen/>
    </NavigationContainer>
  );
}
export default App;

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
