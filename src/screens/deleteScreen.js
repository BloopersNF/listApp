import React, { useState, useEffect } from "react";
import {Text, StyleSheet, View, TouchableOpacity, FlatList, Alert, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

// Tela onde vão aparecer as listas deletadas
const DeleteScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [keys, setKeys] = useState([]);
    const [deletedLists, setDeletedLists] = useState([]);

    // Busca todas as chaves do AsyncStorage
    const getAllKeys = async () => {
        try {
            const all = await AsyncStorage.getAllKeys();
            setKeys(all);
            return all;
        } catch(e) {
            console.log(e);
            return [];
        }
    }
    
    // Busca todas as listas deletadas a partir das chaves
    const getDeletedLists = async (allKeys) => {
        let lists = [];
        try {
            for (let i = 0; i < allKeys.length; i++) {
                let list = await AsyncStorage.getItem(allKeys[i]);
                if (list != null) {
                    list = JSON.parse(list);
                    if (list.DeletedAt) {
                        const deletedAt = new Date(list.DeletedAt);
                        const now = new Date();
                        const diffTime = Math.abs(now - deletedAt);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays >= 7 && (list.Deleted == true)) { // Deleta após 7 dias
                            await deleteList(list.Id);
                        }
                    }
                    if (list.Deleted) {
                        lists.push({...list});
                    }
                }
            }
        } catch(e) {
            console.log(e);
        }
        return lists; 
    }

    // Atualiza os estados de chaves e listas deletadas
    const fetchAndUpdateLists = async () => {
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
        } catch(e) {
            console.log(e);
        }
    }

    // Restaura uma lista deletada
    const restoreList = async (key) => {
        try {
            let list = await AsyncStorage.getItem(key);
            list = JSON.parse(list);
            list.Deleted = false;
            await AsyncStorage.setItem(key, JSON.stringify(list));
            fetchAndUpdateLists();
        } catch(e) {
            console.log(e);
        }
    }

    // Remove todas as listas marcadas como deletadas
    const clearAllDeletedLists = async () => {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            for (let i = 0; i < allKeys.length; i++) {
                let list = await AsyncStorage.getItem(allKeys[i]);
                if (list != null) {
                    list = JSON.parse(list);
                    if (list.Deleted) {
                        await AsyncStorage.removeItem(allKeys[i]);
                    }
                }
            }
            await fetchAndUpdateLists();
        } catch(e) {
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
            <FlatList
                data={deletedLists}
                renderItem={({ item }) => {
                    if (item.Deleted)
                        {
                            return(
                                <TouchableOpacity 
                                    style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                                    onPress={() => Alert.alert("Essa lista será deletada em breve. Delete agora ou restaure.")}
                                >
                                    <Text style={[styles.listName, { color: colors.text }]}>{item.Name}</Text>
                                    <View style={styles.buttons}>
                                        <TouchableOpacity onPress={() => restoreList(item.Id)}>
                                        <Icon name="reload1" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            Alert.alert(
                                                "Você realmente deseja deletar esta lista permanentemente?",
                                                "",
                                                [
                                                    {
                                                        text: "Cancelar",
                                                        style: "cancel"
                                                    },
                                                    { text: "Deletar", onPress: async () => await deleteList(item.Id) }
                                                ],
                                                { cancelable: false }
                                            );
                                        }}>
                                        <Icon name="delete" size={20} color={colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                                );
                            }
                        }}
                        keyExtractor={item => item.Id}
                        />
                        
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        margin: 5,
        borderRadius: 5,
        borderWidth: 1,
    },
    listName: {
        fontSize: 20,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 15,
    },
});

export default DeleteScreen;