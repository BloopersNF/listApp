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

    
    //função que pega todas as listas deletadas
    getDeletedLists = async () => {
        try {
            let lists = [];
            for (let i = 0; i < keys.length; i++) {
                let list = await AsyncStorage.getItem(keys[i]);
                if (list != null) {
                    list = JSON.parse(list);

                    if (list.Deleted) {
                        lists.push(list);
                    }
                }
            }
            setDeletedLists(lists);
            
        } catch(e) {
            console.log(e);
        }
    }

    //função que deleta uma lista
    deleteList = async (key) => {
        try {
            await AsyncStorage.removeItem(key);
            getDeletedLists();
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
            getAllKeys();
            getDeletedLists();
        } catch(e) {
            console.log(e);
        }
    }
    
    useEffect(() => {
        const fetchData = async () => {
            await getAllKeys();
            await getDeletedLists();
        }
        fetchData();
    }
    , [keys.length]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                getAllKeys();
                getDeletedLists();
            }
            fetchData();
        }, [])
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={Object.keys(deletedLists)}
                renderItem={({ item }) => {
                    if (deletedLists[item].Deleted)
                        {
                            return(
                            <View style={styles.listItem}>
                                <TouchableOpacity onPress={() => Alert.alert("Essa lista será deletada em breve. Delete agora ou restaure.")}>
                                    <Text style={styles.listName}>{deletedLists[item].Name}</Text>
                                </TouchableOpacity>
                                <View style={styles.buttons}>
                                    <TouchableOpacity onPress={() => restoreList(deletedLists[item].Name)}>
                                        <Icon name="reload1" size={20} color="#000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => deleteList(deletedLists[item].Name)}>
                                        <Icon name="delete" size={20} color="#000" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            );
                        }
                    }}
                keyExtractor={item => item}
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
    },
});

export default DeleteScreen;