import {React} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './mainScreen';
import ListScreen from './listScreen';

const Stack = createStackNavigator();

const StackScreen = ({navigation}) =>{
    return(
        <Stack.Navigator>
            <Stack.Screen name="Home" component={MainScreen}/>
            <Stack.Screen name="List" component={ListScreen}/>
        </Stack.Navigator>
    )
}
export default StackScreen;