import {React} from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from './homeScreen';
import DeleteScreen from './deleteScreen';
import ConfigScreen from './configScreen';

Tab = createBottomTabNavigator();

const MainScreen = () =>{
    return(
    <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen}/>
        <Tab.Screen name="List" component={ConfigScreen}/>
        <Tab.Screen name="Delete" component={DeleteScreen}/>
    </Tab.Navigator>
    )
}
export default MainScreen;