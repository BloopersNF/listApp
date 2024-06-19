import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, TouchableOpacity, Modal, Button, TextInput, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateButton from "../components/createButton";
import Icon from "react-native-vector-icons/AntDesign";
import List from "../components/List";

const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    }
    catch(e) {
        console.log(e);
    }
}

const storeData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    }
    catch (e) {
        console.log(e);
        }
    }

const HomeScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState('');
    const [keys, setKeys] = useState([]);
    getAllKeys = async () => {
        try {
            all = await AsyncStorage.getAllKeys();
            setKeys(all);
        } catch(e) {
            console.log(e);
        }
        return keys;
    }

    useEffect(() => {
        getAllKeys();
    }, []);


    const closeModal = () => {
        setModalVisible(false);
    }
    
    const createList = () => {
        setModalVisible(false);
        navigation.navigate('List', {name: listName});
        storeData(listName, new List(listName, [], 0));
        setListName('');
        setKeys(getAllKeys());
    };
    
    return(
        <View style={{position: "relative", height: "100%", width: "100%", backgroundColor:"#eee"}}>
            <View>
                <FlatList
                    data={keys}
                    renderItem={({item}) =>
                            <TouchableOpacity onPress={() => navigation.navigate('List', {name: item})}>
                                <View style={styles.listItem}>
                                    <Text>{item}</Text>
                                    <TouchableOpacity onPress={() => {
                                        removeData(item);
                                        setKeys(getAllKeys());
                                    }}>
                                        <Icon name="delete" size={24} color="#e22"/>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>

                    }
                    keyExtractor={(item) => item}
                />     
            </View>
            <View style={{position:"absolute", bottom:10, right:10}}>
                <CreateButton method={() => setModalVisible(true)}/>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    closeModal();
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text>Nome da Lista</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={setListName}
                            value={listName}
                        />
                        <Button onPress={createList} title="Criar Lista" />
                        <Button onPress={closeModal} title="Voltar" />
                    </View>
                </View>
            </Modal>
        
        </View>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
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
    },
    listItem: {
        padding: 20,
        borderColor: "#fff",
        borderWidth: 1,
        backgroundColor: "#fff",
        margin: 5,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    }
});

export default HomeScreen;