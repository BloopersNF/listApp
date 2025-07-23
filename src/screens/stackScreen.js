import {React} from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './mainScreen';
import ListScreen from './listScreen';
import AdBanner from '../components/AdBanner';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

const StackScreen = ({navigation}) =>{
    const { colors } = useTheme();
    
    return(
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <AdBanner />
            <View style={styles.navigatorContainer}>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="Main" component={MainScreen} />
                    <Stack.Screen name="List" component={ListScreen}/>
                </Stack.Navigator>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navigatorContainer: {
        flex: 1,
    },
});

export default StackScreen;