import React, { useState, useEffect } from "react";
import {Text, StyleSheet, View, TouchableOpacity, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";
import { useFocusEffect } from '@react-navigation/native';

//tela onde vão aparecer as listas deletadas
const DeleteScreen = ({ navigation }) => {
    const [keys, setKeys] = useState([]);
    const [deletedLists, setDeletedLists] = useState([]);

    //função que pega todas as chaves do async storage
    getAllKeys = async () => {
        try {
            all = await AsyncStorage.getAllKeys();
            setKeys(all);
        } catch(e) {
            console.log(e);
        }
        return keys;
    }

    const fetchAndUpdateLists = async () => {
        const allKeys = await getAllKeys(); // Pega todas as chaves
        const lists = await getDeletedLists(allKeys); // Passa as chaves atualizadas como argumento
        setKeys(allKeys); // Atualiza o estado das chaves
        setDeletedLists(lists); // Atualiza o estado das listas deletadas
    }

    
    //função que pega todas as listas deletadas
    getDeletedLists = async (allKeys) => {
        let lists = [];
        try {
            for (let i = 0; i < allKeys.length; i++) {
                let list = await AsyncStorage.getItem(allKeys[i]);
                if (list != null) {
                    list = JSON.parse(list);
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

    //função que deleta uma lista
    deleteList = async (key) => {
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

    //função que restaura uma lista
    restoreList = async (key) => {
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

    const clearAllLists = async () => {
        try {
            await AsyncStorage.clear();
        } catch(e) {
            console.log(e);
        }
    }

    
    useEffect(() => {
        const fetchData = async () => {
            await fetchAndUpdateLists();
        }
        fetchData();
    }
    , []);

    useEffect(() => {
        const fetchData = async () => {
            await fetchAndUpdateLists();
        }
        fetchData();
    }
    , [deletedLists.length]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                await fetchAndUpdateLists();
            }
            fetchData();
        }, [])
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={deletedLists}
                renderItem={({ item }) => {
                    if (item.Deleted)
                        {
                            return(
                                <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert("Essa lista será deletada em breve. Delete agora ou restaure.")}>
                                    <Text style={styles.listName}>{item.Name}</Text>
                                    <View style={styles.buttons}>
                                        <TouchableOpacity onPress={() => restoreList(item.Id)}>
                                        <Icon name="reload1" size={20} color="#000" />
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
                                        <Icon name="delete" size={20} color="#000" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                                );
                            }
                        }}
                        keyExtractor={item => item.key}
                        />
                        
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#eee",
        padding: 10,
    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        margin: 5,
        backgroundColor: "#fff",
        borderRadius: 5,
    },
    listName: {
        fontSize: 20,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",

    },
});

export default DeleteScreen;