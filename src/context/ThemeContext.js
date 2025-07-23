import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('isDarkMode');
            if (savedTheme !== null) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const theme = {
        isDarkMode,
        colors: {
            background: isDarkMode ? '#121212' : '#eee',
            surface: isDarkMode ? '#1e1e1e' : '#fff',
            text: isDarkMode ? '#ffffff' : '#000000',
            textSecondary: isDarkMode ? '#aaaaaa' : '#bdbdbd',
            textTertiary: isDarkMode ? '#888888' : '#bbb',
            primary: '#4151E1',
            danger: '#E15141',
            success: '#2b2',
            border: isDarkMode ? '#333333' : '#ddd',
            borderLight: isDarkMode ? '#444444' : '#eee',
            shadow: isDarkMode ? '#000000' : '#000000',
        }
    };

    return (
        <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
