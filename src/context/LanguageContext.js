import React, { createContext, useContext, useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lang from '../langs/lang';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const getDeviceLanguage = () => {
    let deviceLanguage = 'en'; // Default fallback

    try {
        // Try using Expo Localization first (more reliable)
        if (Localization.locale) {
            deviceLanguage = Localization.locale;
        } else if (Platform.OS === 'ios') {
            deviceLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
                           NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                           'en';
        } else {
            deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
        }

        // Extract language code (e.g., "pt-BR" -> "pt", "en-US" -> "en")
        const languageCode = deviceLanguage.toLowerCase().split(/[-_]/)[0];
        
        // Map some language codes to our supported languages
        const languageMap = {
            'pt': 'pt',
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'zh': 'cn',
            'zh-cn': 'cn',
            'zh-hans': 'cn'
        };

        return languageMap[languageCode] || 'en';
    } catch (error) {
        console.log('Error getting device language:', error);
        return 'en';
    }
};

export const LanguageProvider = ({ children }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeLanguage = async () => {
            try {
                // Try to get saved language from AsyncStorage
                const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
                
                if (savedLanguage && lang.languages[savedLanguage]) {
                    setSelectedLanguage(savedLanguage);
                } else {
                    // If no saved language, detect device language
                    const deviceLang = getDeviceLanguage();
                    setSelectedLanguage(deviceLang);
                    // Save the detected language
                    await AsyncStorage.setItem('selectedLanguage', deviceLang);
                }
            } catch (error) {
                console.log('Error initializing language:', error);
                setSelectedLanguage('en');
            } finally {
                setIsLoading(false);
            }
        };

        initializeLanguage();
    }, []);

    const changeLanguage = async (languageCode) => {
        try {
            if (lang.languages[languageCode]) {
                setSelectedLanguage(languageCode);
                await AsyncStorage.setItem('selectedLanguage', languageCode);
            }
        } catch (error) {
            console.log('Error changing language:', error);
        }
    };

    const getText = (key, replacements = {}) => {
        const text = lang.languages[selectedLanguage]?.[key] || lang.languages.en[key] || key;
        
        // Replace placeholders like {0}, {1} with actual values
        if (typeof text === 'string' && Object.keys(replacements).length > 0) {
            return text.replace(/\{(\w+)\}/g, (match, key) => {
                return replacements[key] !== undefined ? replacements[key] : match;
            });
        }
        
        return text;
    };

    const value = {
        selectedLanguage,
        changeLanguage,
        getText,
        isLoading,
        availableLanguages: [
            { code: "en", name: "English", flag: "🇺🇸" },
            { code: "pt", name: "Português", flag: "🇧🇷" },
            { code: "es", name: "Español", flag: "🇪🇸" },
            { code: "fr", name: "Français", flag: "🇫🇷" },
            { code: "cn", name: "中文", flag: "🇨🇳" }
        ]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
