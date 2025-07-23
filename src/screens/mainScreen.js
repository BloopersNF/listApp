import {React} from 'react'
import {StyleSheet, View} from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './homeScreen';
import DeleteScreen from './deleteScreen';
import ConfigScreen from './configScreen';
import Icon from 'react-native-vector-icons/AntDesign';
import { useTheme } from '../context/ThemeContext';

Tab = createBottomTabNavigator();

const MainScreen = () =>{
    const { colors } = useTheme();
    
    return(
        <Tab.Navigator 
            screenOptions={{
                tabBarShowLabel:false, 
                tabBarStyle:[styles.navigator, { backgroundColor: colors.surface }], 
                headerShown: false,
                tabBarInactiveTintColor: colors.textTertiary,
            }} 
            initialRouteName={"Home"}
        >
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
        position: 'absolute',
        bottom: 10,
        left: '2.5%',
        right: '2.5%',
        backgroundColor: '#f8f8f8',
        borderRadius: 50,
        height: 65,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
        paddingBottom: 0,
        paddingTop: 0,
        borderTopWidth: 0,
    }
})
export default MainScreen;