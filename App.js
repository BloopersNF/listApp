import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './src/screens/mainScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StackScreen from './src/screens/stackScreen';
import * as firebase from 'firebase';

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
  return (
    <NavigationContainer>
      <StackScreen/>
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
