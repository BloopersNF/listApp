import React, { useState, useEffect } from "react";
import { SafeAreaView, Alert, Platform, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, Modal, Button, TextInput, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateButton from "../components/createButton";
import Icon from "react-native-vector-icons/AntDesign";
import List from "../components/List";
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { formatCurrency } from "../utils/currency";





const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    }
    catch (e) {
        console.log("erro no get data:", e);
    }
}

const storeData = async (key, value) => {
    try {
        if (!key || key.trim() === '') {
            console.log('Invalid key provided to storeData:', key);
            return;
        }
        if (!value) {
            console.log('Invalid value provided to storeData:', value);
            return;
        }
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    }
    catch (e) {
        console.log('Error in storeData:', e);
    }
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0'); // Adiciona um zero à esquerda se necessário
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() retorna um índice base-0, então adicionamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

const clearAllLists = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) {
        console.log(e);
    }
}

const cleanCorruptedData = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = [];

        // Keys que são configurações do usuário e não devem ser deletadas
        const userConfigKeys = [
            'isDarkMode',
            'selectedLanguage',
            'listScreenVisitCount',
            'listSortPreference',
            'userPreferences',
            'appSettings'
        ];

        for (const key of allKeys) {
            // Pular keys de configuração do usuário
            if (userConfigKeys.includes(key)) {
                continue;
            }

            if (!key || key.trim() === '') {
                keysToRemove.push(key);
                continue;
            }

            try {
                const data = await AsyncStorage.getItem(key);
                if (!data) {
                    keysToRemove.push(key);
                    continue;
                }

                const parsedData = JSON.parse(data);
                if (!parsedData || !parsedData.Name || !parsedData.Id) {
                    keysToRemove.push(key);
                }
            } catch (parseError) {
                keysToRemove.push(key);
            }
        }

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            console.log('Removed corrupted keys:', keysToRemove);
        }
    } catch (e) {
        console.log('Error cleaning corrupted data:', e);
    }
}


const HomeScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { getText } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState('');
    const [keys, setKeys] = useState([]);
    const [lists, setLists] = useState([]);
    const [id, setId] = useState(0);

    getAllKeys = async () => {
        try {
            const all = await AsyncStorage.getAllKeys();

            // Keys que são configurações do usuário e não devem aparecer na lista
            const userConfigKeys = [
                'isDarkMode',
                'selectedLanguage',
                'listScreenVisitCount',
                'listSortPreference',
                'userPreferences',
                'appSettings'
            ];

            // Filtrar apenas keys que são listas (não são configurações)
            const listKeys = all.filter(key => !userConfigKeys.includes(key));

            setKeys(listKeys);
            return listKeys;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    const fetchLists = async () => {
        try {
            const fetchedKeys = await getAllKeys();
            if (!fetchedKeys || fetchedKeys.length === 0) {
                setLists([]);
                return;
            }

            const fetchedLists = await Promise.all(
                fetchedKeys
                    .filter(key => key && key.trim() !== '') // Filtra chaves válidas
                    .map(async (key) => {
                        try {
                            const data = await getData(key);
                            // Verificar se é realmente uma lista válida
                            if (data &&
                                data.Name &&
                                data.Id &&
                                typeof data.Name === 'string' &&
                                data.Name.trim() !== '') {
                                return data;
                            }
                            return null;
                        } catch (error) {
                            console.log('Error fetching data for key:', key, error);
                            return null;
                        }
                    })
            );

            const filteredLists = fetchedLists.filter(list =>
                list !== null &&
                list !== undefined &&
                list.Name &&
                list.Name.trim() !== '' &&
                list.Id &&
                !list.Deleted // Não mostrar listas deletadas
            );

            setLists(filteredLists);
        } catch (error) {
            console.log('Error in fetchLists:', error);
            setLists([]);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            await cleanCorruptedData();
            await getAllKeys();
            await fetchLists();
        }
        fetchData();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            await getAllKeys();
            await fetchLists();
        }
        fetchData();
    }, [keys.length]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                await getAllKeys();
                await fetchLists();
            }
            fetchData();
        }, [])
    );



    const closeModal = () => {
        setModalVisible(false);
    }

    const createList = async () => {
        if (!listName || listName.trim() === '') {
            Alert.alert(getText('invalidListName'));
            return;
        }

        try {
            const newId = uuid.v4();
            const newDate = formatDate(new Date());

            if (!newId) {
                Alert.alert(getText('errorGeneratingId'));
                return;
            }

            const newList = new List(listName.trim(), [], 0, false, newId, newDate);
            console.log('Creating list with ID:', newId);

            await storeData(newId, newList);
            setListName('');
            await fetchLists();
            setModalVisible(false);
            navigation.navigate('List', { name: listName.trim(), id: String(newId), date: newDate });
        } catch (error) {
            console.log('Error creating list:', error);
            Alert.alert(getText('errorCreatingList'));
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={Object.keys(lists)}
                renderItem={({ item }) => {
                    const list = lists[item];

                    // Verificações de segurança
                    if (!list || list.Deleted || !list.Name || !list.Id) {
                        return null;
                    }

                    return (
                        <TouchableOpacity
                            style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                            onPress={() => navigation.navigate('List', { name: list.Name, id: list.Id })}
                        >
                            <View style={styles.listContent}>
                                <View style={styles.listHeader}>
                                    <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
                                        {list.Name}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={async () => {
                                            try {
                                                const deletedList = { ...list };
                                                deletedList.Deleted = true;
                                                deletedList.DeletedAt = new Date().toISOString();
                                                await storeData(deletedList.Id, deletedList);
                                                await fetchLists();
                                            } catch (error) {
                                                console.log('Error deleting list:', error);
                                            }
                                        }}
                                    >
                                        <Icon name="delete" size={20} color="#e22" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.listFooter}>
                                    <Text style={[styles.listInfo, { color: colors.textTertiary }]}>
                                        {list.Items?.length || 0} {getText('items')}
                                    </Text>
                                    <Text style={[styles.listDate, { color: colors.textTertiary }]}>
                                        {list.Date || ''}
                                    </Text>
                                    <Text style={[styles.listPrice, { color: "#2b2" }]}>
                                        {formatCurrency(list.TotalPrice || 0)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item) => item}
                initialNumToRender={10}
                removeClippedSubviews={true}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            <CreateButton method={() => setModalVisible(true)} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    closeModal();
                }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <View style={styles.centeredView}>
                        <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                            <Text style={{ color: colors.textSecondary }}>{getText('listNamePlaceholder')}</Text>
                            <TextInput
                                style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                                onChangeText={setListName}
                                value={listName}
                                placeholder={getText('listNamePlaceholder')}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <TouchableOpacity onPress={closeModal} title={getText('close')}>
                                    <Icon name="closecircleo" size={50} color="#E15141"></Icon>
                                </TouchableOpacity>
                                <View style={{ marginRight: 100 }}></View>
                                <TouchableOpacity onPress={createList} title={getText('createList')}>
                                    <Icon name="checkcircleo" size={50} color="#4151E1"></Icon>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        borderRadius: 40,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    textInput: {
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 15,
    },
    listItem: {
        padding: 16,
        borderWidth: 1,
        margin: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    listContent: {
        flex: 1,
    },
    listHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        marginRight: 12,
    },
    deleteButton: {
        padding: 4,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 28,
        minHeight: 28,
    },
    listFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    listInfo: {
        fontSize: 12,
        fontWeight: "500",
    },
    listDate: {
        fontSize: 12,
        fontWeight: "400",
    },
    listPrice: {
        fontSize: 12,
        fontWeight: "bold",
    },
});

export default HomeScreen;