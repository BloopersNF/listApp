import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Alert, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const USER_CONFIG_KEYS = new Set([
    'isDarkMode',
    'selectedLanguage',
    'languageMode',
    'listScreenVisitCount',
    'listSortPreference',
    'userPreferences',
    'appSettings'
]);

const isValidStoredList = (value) => (
    value &&
    typeof value === 'object' &&
    typeof value.Id === 'string' &&
    typeof value.Name === 'string' &&
    Array.isArray(value.Items)
);

// Tela onde vão aparecer as listas deletadas
const DeleteScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { getText } = useLanguage();
    const [keys, setKeys] = useState([]);
    const [deletedLists, setDeletedLists] = useState([]);

    const getStoredList = async (key) => {
        if (!key || USER_CONFIG_KEYS.has(key)) {
            return null;
        }

        try {
            const storedValue = await AsyncStorage.getItem(key);
            if (storedValue == null) {
                return null;
            }

            const parsedValue = JSON.parse(storedValue);
            return isValidStoredList(parsedValue) ? parsedValue : null;
        } catch (e) {
            console.log('Ignoring non-list AsyncStorage key in trash:', key, e);
            return null;
        }
    }

    // Busca todas as chaves do AsyncStorage
    const getAllKeys = async () => {
        try {
            const all = await AsyncStorage.getAllKeys();
            const listKeys = all.filter(key => !USER_CONFIG_KEYS.has(key));
            setKeys(listKeys);
            return listKeys;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    // Remove listas deletadas há mais de 7 dias
    const removeExpiredDeletedLists = async () => {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            for (let i = 0; i < allKeys.length; i++) {
                const key = allKeys[i];
                const list = await getStoredList(key);
                if (list?.DeletedAt && list.Deleted) {
                    const deletedAt = new Date(list.DeletedAt);
                    if (!Number.isNaN(deletedAt.getTime())) {
                        const now = new Date();
                        const diffDays = (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24);
                        if (diffDays >= 7) {
                            await AsyncStorage.removeItem(key);
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    // Busca todas as listas deletadas a partir das chaves
    const getDeletedLists = async (allKeys) => {
        let lists = [];
        try {
            for (let i = 0; i < allKeys.length; i++) {
                const list = await getStoredList(allKeys[i]);
                if (list?.Deleted) {
                    lists.push({ ...list });
                }
            }
        } catch (e) {
            console.log(e);
        }
        return lists.sort((a, b) => new Date(b.DeletedAt || 0) - new Date(a.DeletedAt || 0));
    }

    // Atualiza os estados de chaves e listas deletadas
    const fetchAndUpdateLists = async () => {
        await removeExpiredDeletedLists();
        const allKeys = await getAllKeys();
        const lists = await getDeletedLists(allKeys);
        setKeys(allKeys);
        setDeletedLists(lists);
    }

    // Deleta uma lista permanentemente
    const deleteList = async (key) => {
        try {
            console.log("Deletando: ", key);
            await AsyncStorage.removeItem(key);
            const newKeys = await AsyncStorage.getAllKeys();
            setKeys(newKeys);
            await fetchAndUpdateLists();
        } catch (e) {
            console.log(e);
        }
    }

    // Restaura uma lista deletada
    const restoreList = async (key) => {
        try {
            const list = await getStoredList(key);
            if (!list) {
                return;
            }
            list.Deleted = false;
            list.DeletedAt = null;
            await AsyncStorage.setItem(key, JSON.stringify(list));
            fetchAndUpdateLists();
        } catch (e) {
            console.log(e);
        }
    }

    // Remove todas as listas marcadas como deletadas
    const clearAllDeletedLists = async () => {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            for (let i = 0; i < allKeys.length; i++) {
                const list = await getStoredList(allKeys[i]);
                if (list?.Deleted) {
                    await AsyncStorage.removeItem(allKeys[i]);
                }
            }
            await fetchAndUpdateLists();
        } catch (e) {
            console.log(e);
        }
    }

    // Atualiza listas ao montar o componente
    useEffect(() => {
        const fetchData = async () => {
            await fetchAndUpdateLists();
        }
        fetchData();
    }, []);

    // Atualiza listas sempre que a tela ganhar foco
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                await fetchAndUpdateLists();
            }
            fetchData();
        }, [])
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {deletedLists.length > 0 ? (
                <>
                    <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{getText('deletedLists')}</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            {deletedLists.length} {deletedLists.length === 1 ? getText('listInTrash') : getText('listsInTrash')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.clearAllButton, { backgroundColor: colors.danger }]}
                            onPress={() => {
                                Alert.alert(
                                    getText('clearTrashConfirm'),
                                    getText('clearTrashMessage'),
                                    [
                                        { text: getText('cancel'), style: "cancel" },
                                        { text: getText('clearAll'), onPress: clearAllDeletedLists, style: "destructive" }
                                    ]
                                );
                            }}
                        >
                            <Icon name="delete" size={16} color="#fff" />
                            <Text style={styles.clearAllText}>{getText('clearAll')}</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={deletedLists}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        renderItem={({ item, index }) => {
                            if (item.Deleted) {
                                const deletedDate = item.DeletedAt ? new Date(item.DeletedAt).toLocaleDateString('pt-BR') : '';
                                return (
                                    <View style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                                        <View style={styles.listContent}>
                                            <View style={styles.listInfo}>
                                                <Text style={[styles.listName, { color: colors.text }]} numberOfLines={1}>
                                                    {item.Name}
                                                </Text>
                                                <Text style={[styles.listDetails, { color: colors.textTertiary }]}>
                                                    {item.Items?.length || 0} {getText('items')} • {getText('deletedOn')} {deletedDate}
                                                </Text>
                                            </View>

                                            <View style={styles.actions}>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.restoreButton, { backgroundColor: colors.primary }]}
                                                    onPress={() => restoreList(item.Id)}
                                                >
                                                    <Icon name="reload1" size={18} color="#fff" />
                                                    <Text style={styles.actionText}>{getText('restore')}</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.danger }]}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            getText('deleteForever'),
                                                            getText('deleteForeverMessage', { 0: item.Name }),
                                                            [
                                                                { text: getText('cancel'), style: "cancel" },
                                                                { text: getText('delete'), onPress: async () => await deleteList(item.Id), style: "destructive" }
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Icon name="delete" size={18} color="#fff" />
                                                    <Text style={styles.actionText}>{getText('delete')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }
                            return null;
                        }}
                        keyExtractor={item => item.Id}
                    />
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="delete" size={80} color={colors.textTertiary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{getText('emptyTrash')}</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        {getText('emptyTrashMessage')}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        marginBottom: 15,
    },
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    clearAllText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },
    listItem: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    listContent: {
        padding: 16,
    },
    listInfo: {
        marginBottom: 12,
    },
    listName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    listDetails: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        flex: 1,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    restoreButton: {
        // Cor definida inline com colors.primary
    },
    deleteButton: {
        // Cor definida inline com colors.danger
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default DeleteScreen;
