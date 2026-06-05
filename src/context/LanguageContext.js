import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lang from '../langs/lang';
import i18n from '../i18n';

// Tentativa de importar expo-localization com fallback
let Localization;
try {
    Localization = require('expo-localization');
} catch (error) {
    console.log('expo-localization not available, using fallback');
    Localization = null;
}

const LanguageContext = createContext();

const STORAGE_LANGUAGE_KEY = 'selectedLanguage';
const STORAGE_LANGUAGE_MODE_KEY = 'languageMode';
const SUPPORTED_LANGUAGES = new Set(Object.keys(lang.languages));

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const resolveLanguageCode = (locale) => {
    if (!locale) {
        return 'en';
    }

    const normalized = String(locale).toLowerCase();
    const baseCode = normalized.split(/[-_]/)[0];

    if (baseCode === 'zh') {
        return 'cn';
    }

    if (SUPPORTED_LANGUAGES.has(baseCode)) {
        return baseCode;
    }

    if (SUPPORTED_LANGUAGES.has(normalized)) {
        return normalized;
    }

    return 'en';
};

const getDeviceLanguage = () => {
    let deviceLanguage = 'en';

    try {
        if (Localization) {
            if (typeof Localization.getLocales === 'function') {
                const locales = Localization.getLocales();
                if (Array.isArray(locales) && locales.length > 0) {
                    deviceLanguage = locales[0].languageTag || locales[0].languageCode || deviceLanguage;
                }
            } else if (Localization.locale) {
                deviceLanguage = Localization.locale;
            }
        } else if (Platform.OS === 'ios') {
            deviceLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
                NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                'en';
        } else {
            deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
        }

        return resolveLanguageCode(deviceLanguage);
    } catch (error) {
        console.log('Error getting device language:', error);
        return 'en';
    }
};

export const LanguageProvider = ({ children }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [languageMode, setLanguageMode] = useState('auto');
    const [isLoading, setIsLoading] = useState(true);
    const languageModeRef = useRef(languageMode);
    const selectedLanguageRef = useRef(selectedLanguage);
    const isMountedRef = useRef(true);

    useEffect(() => {
        languageModeRef.current = languageMode;
    }, [languageMode]);

    useEffect(() => {
        selectedLanguageRef.current = selectedLanguage;
    }, [selectedLanguage]);

    useEffect(() => {
        const initializeLanguage = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(STORAGE_LANGUAGE_MODE_KEY);
                const savedLanguage = await AsyncStorage.getItem(STORAGE_LANGUAGE_KEY);
                const deviceLanguage = getDeviceLanguage();

                if (savedMode === 'manual' && savedLanguage && SUPPORTED_LANGUAGES.has(savedLanguage)) {
                    await applyLanguage(savedLanguage, 'manual');
                } else if (savedMode === 'auto') {
                    await applyLanguage(deviceLanguage, 'auto');
                } else if (savedLanguage && SUPPORTED_LANGUAGES.has(savedLanguage) && savedLanguage !== deviceLanguage) {
                    await applyLanguage(savedLanguage, 'manual');
                } else {
                    await applyLanguage(deviceLanguage, 'auto');
                }
            } catch (error) {
                console.log('Error initializing language:', error);
                await applyLanguage('en', 'auto');
            } finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        };

        initializeLanguage();
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!Localization || typeof Localization.addLocalizationListener !== 'function') {
            return undefined;
        }

        const handleLocalizationChange = () => {
            if (languageModeRef.current !== 'auto') {
                return;
            }

            const deviceLanguage = getDeviceLanguage();
            if (deviceLanguage !== selectedLanguageRef.current) {
                applyLanguage(deviceLanguage, 'auto');
            }
        };

        const subscription = Localization.addLocalizationListener(handleLocalizationChange);
        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else if (Localization?.removeLocalizationListener) {
                Localization.removeLocalizationListener(handleLocalizationChange);
            }
        };
    }, []);

    const applyLanguage = async (languageCode, mode) => {
        const resolvedLanguage = resolveLanguageCode(languageCode);

        try {
            await i18n.changeLanguage(resolvedLanguage);
            await AsyncStorage.setItem(STORAGE_LANGUAGE_KEY, resolvedLanguage);
            await AsyncStorage.setItem(STORAGE_LANGUAGE_MODE_KEY, mode);

            if (isMountedRef.current) {
                setSelectedLanguage(resolvedLanguage);
                setLanguageMode(mode);
            }
        } catch (error) {
            console.log('Error applying language:', error);
        }
    };

    const changeLanguage = async (languageCode) => {
        if (SUPPORTED_LANGUAGES.has(languageCode)) {
            await applyLanguage(languageCode, 'manual');
        }
    };

    const setAutoLanguage = async () => {
        await applyLanguage(getDeviceLanguage(), 'auto');
    };

    const getText = (key, replacements = {}) => i18n.t(key, replacements);

    const value = {
        selectedLanguage,
        languageMode,
        changeLanguage,
        setAutoLanguage,
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
