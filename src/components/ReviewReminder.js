import React, { useEffect, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useAds } from '../context/AdsContext';
import { confirmReview, shouldRemindOnLaunch } from '../utils/storeReviewPrompt';

const REVIEW_STATE_KEY = 'storeReviewPromptState';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.marketlist.app&showAllReviews=true';
const PLAY_STORE_APP_URL = 'market://details?id=com.marketlist.app&showAllReviews=true';

const ReviewReminder = () => {
    const { getText, isLoading } = useLanguage();
    const { busy: adsBusy, status: adsStatus } = useAds();
    const checkedThisLaunch = useRef(false);

    useEffect(() => {
        if (Platform.OS !== 'android' || isLoading || checkedThisLaunch.current || adsBusy || adsStatus === 'idle') {
            return undefined;
        }

        checkedThisLaunch.current = true;
        let active = true;

        const remindIfNeeded = async () => {
            try {
                const stored = await AsyncStorage.getItem(REVIEW_STATE_KEY);
                const state = stored ? JSON.parse(stored) : null;
                if (!active || !shouldRemindOnLaunch(state)) {
                    return;
                }

                Alert.alert(
                    getText('reviewReminderTitle'),
                    getText('reviewReminderMessage'),
                    [
                        { text: getText('reviewReminderLater'), style: 'cancel' },
                        {
                            text: getText('reviewReminderReviewed'),
                            onPress: async () => {
                                try {
                                    const latest = await AsyncStorage.getItem(REVIEW_STATE_KEY);
                                    const currentState = latest ? JSON.parse(latest) : null;
                                    await AsyncStorage.setItem(
                                        REVIEW_STATE_KEY,
                                        JSON.stringify(confirmReview(currentState))
                                    );
                                } catch (error) {
                                    console.warn('Could not save review confirmation:', error);
                                }
                            },
                        },
                        {
                            text: getText('reviewReminderRate'),
                            onPress: async () => {
                                try {
                                    await Linking.openURL(PLAY_STORE_APP_URL);
                                } catch (error) {
                                    try {
                                        await Linking.openURL(PLAY_STORE_URL);
                                    } catch (fallbackError) {
                                        Alert.alert(getText('feedbackStoreUnavailable'));
                                    }
                                }
                            },
                        },
                    ]
                );
            } catch (error) {
                console.warn('Could not prepare review reminder:', error);
            }
        };

        remindIfNeeded();
        return () => { active = false; };
    }, [isLoading, adsBusy, adsStatus]);

    return null;
};

export default ReviewReminder;
