import React, { useState } from "react";
import { FlatList, Text, StyleSheet, View, SafeAreaView, TouchableOpacity, Switch, Modal, Alert, Linking } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import lang from "../langs/lang";
import { useTheme } from "../context/ThemeContext";

const ConfigScreen = () => {
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const [selected, setSelected] = useState("en");
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const handleContactUs = () => {
        const email = lang.languages[selected].contactEmail;
        const subject = "List App Support";
        const body = "Hello, I need help with...";
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        Linking.canOpenURL(mailtoUrl)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(mailtoUrl);
                } else {
                    Alert.alert("Email not available", `Please contact us at: ${email}`);
                }
            })
            .catch(() => {
                Alert.alert("Email not available", `Please contact us at: ${email}`);
            });
    };

    const availableLanguages = [
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "pt", name: "Português", flag: "🇧🇷" },
        { code: "es", name: "Español", flag: "🇪🇸" },
        { code: "fr", name: "Français", flag: "🇫🇷" },
        { code: "cn", name: "中文", flag: "🇨🇳" }
    ];

    const handleLanguageSelect = (languageCode) => {
        setSelected(languageCode);
        setLanguageModalVisible(false);
    };

    const configItems = [
        {
            key: lang.languages[selected].language,
            icon: "earth",
            action: () => setLanguageModalVisible(true),
            showArrow: true
        },
        {
            key: lang.languages[selected].theme,
            icon: isDarkMode ? "moon" : "bulb1",
            action: toggleTheme,
            showSwitch: true,
            switchValue: isDarkMode
        },
        {
            key: lang.languages[selected].about,
            icon: "infocirlceo",
            action: () => setAboutModalVisible(true),
            showArrow: true
        },
        {
            key: lang.languages[selected].bePremium,
            icon: "star",
            action: () => Alert.alert(lang.languages[selected].comingSoon),
            showArrow: true,
            isPremium: true
        }
    ];

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        listItem: {
            padding: 20,
            margin: 10,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderLight,
            borderRadius: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        itemLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        itemIcon: {
            marginRight: 15,
        },
        itemText: {
            fontSize: 16,
            color: colors.text,
            fontWeight: "500",
        },
        premiumText: {
            fontSize: 16,
            color: "#FFD700",
            fontWeight: "600",
        },
        itemRight: {
            flexDirection: "row",
            alignItems: "center",
        },
        switch: {
            transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 30,
            alignItems: 'center',
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
            minWidth: 300,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 20,
        },
        modalText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 10,
        },
        modalVersion: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.primary,
            marginBottom: 20,
        },
        contactButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
            marginBottom: 15,
        },
        contactButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '600',
        },
        closeButton: {
            backgroundColor: colors.textTertiary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
        },
        closeButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '600',
        },
        languageItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            borderRadius: 10,
            marginVertical: 5,
            backgroundColor: colors.background,
        },
        selectedLanguageItem: {
            backgroundColor: colors.primary + '20',
            borderWidth: 1,
            borderColor: colors.primary,
        },
        languageFlag: {
            fontSize: 24,
            marginRight: 15,
        },
        languageName: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
        },
        selectedLanguageName: {
            color: colors.primary,
            fontWeight: '600',
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <FlatList
                    data={configItems}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.listItem} 
                            onPress={item.action}
                            activeOpacity={0.7}
                        >
                            <View style={styles.itemLeft}>
                                <View style={styles.itemIcon}>
                                    <Icon 
                                        name={item.icon} 
                                        size={24} 
                                        color={item.isPremium ? "#FFD700" : colors.text} 
                                    />
                                </View>
                                <Text style={item.isPremium ? styles.premiumText : styles.itemText}>
                                    {item.key}
                                </Text>
                            </View>
                            <View style={styles.itemRight}>
                                {item.showSwitch && (
                                    <Switch
                                        style={styles.switch}
                                        value={item.switchValue}
                                        onValueChange={item.action}
                                        trackColor={{ false: colors.border, true: colors.primary }}
                                        thumbColor={item.switchValue ? '#ffffff' : '#f4f3f4'}
                                    />
                                )}
                                {item.showArrow && (
                                    <Icon 
                                        name="right" 
                                        size={16} 
                                        color={colors.textTertiary} 
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={aboutModalVisible}
                onRequestClose={() => setAboutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {lang.languages[selected].about}
                        </Text>
                        <Text style={styles.modalText}>
                            {lang.languages[selected].appVersion}
                        </Text>
                        <Text style={styles.modalVersion}>
                            v{lang.languages[selected].version}
                        </Text>
                        
                        <TouchableOpacity 
                            style={styles.contactButton} 
                            onPress={handleContactUs}
                        >
                            <Text style={styles.contactButtonText}>
                                {lang.languages[selected].contactUs}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => setAboutModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>
                                Fechar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {lang.languages[selected].language}
                        </Text>
                        
                        {availableLanguages.map((language) => (
                            <TouchableOpacity
                                key={language.code}
                                style={[
                                    styles.languageItem,
                                    selected === language.code && styles.selectedLanguageItem
                                ]}
                                onPress={() => handleLanguageSelect(language.code)}
                            >
                                <Text style={styles.languageFlag}>{language.flag}</Text>
                                <Text style={[
                                    styles.languageName,
                                    selected === language.code && styles.selectedLanguageName
                                ]}>
                                    {language.name}
                                </Text>
                                {selected === language.code && (
                                    <Icon 
                                        name="check" 
                                        size={20} 
                                        color={colors.primary} 
                                        style={{ marginLeft: 'auto' }}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                        
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>
                                Fechar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ConfigScreen;