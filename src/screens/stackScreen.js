import {React} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './mainScreen';
import ListScreen from './listScreen';

const Stack = createStackNavigator();

const StackScreen = ({navigation}) =>{
    return(
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="List" component={ListScreen}/>
        </Stack.Navigator>
    )
}
export default StackScreen;