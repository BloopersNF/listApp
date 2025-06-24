import {React} from 'react'
import {StyleSheet, View} from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './homeScreen';
import DeleteScreen from './deleteScreen';
import ConfigScreen from './configScreen';
import Icon from 'react-native-vector-icons/AntDesign';

Tab = createBottomTabNavigator();

const MainScreen = () =>{
    return(
        <Tab.Navigator screenOptions={{tabBarShowLabel:false, tabBarStyle:styles.navigator}} initialRouteName={"Home"}>
            <Tab.Screen 
            name="Delete" 
            component={DeleteScreen} 
            options={{
            tabBarIcon: ({color, size}) => (
                <Icon name="delete" color={color} size={size}/>
            ),
            tabBarActiveTintColor: "#f82323",
            }}/>

            <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{
            tabBarIcon: ({color, size}) => (
                <Icon name="copy1" color={color} size={size}/>
            ),
            tabBarActiveTintColor: "#2323f8",
            
            }}/>

            <Tab.Screen 
            name="Config" 
            component={ConfigScreen} 
            options=
            {{
            tabBarIcon: ({color, size}) => (
                <Icon name="setting" color={color} size={size}/>
            ),
            tabBarActiveTintColor: "#23f823",
            }}/>
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    navigator:{
        padding: 24,
        width: "95%",
        backgroundColor: "#f8f8f8",
        shadowOffset: {width: 5, height: 3},
        shadowColor: "black",
        shadowOpacity: 0.5,
        alignSelf: "center",
        borderRadius: 50,
        bottom: 10,
    }
})
export default MainScreen;