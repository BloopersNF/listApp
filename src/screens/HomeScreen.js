import React, { useState, useEffect } from "react";
import {SafeAreaView ,Alert, Platform, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, Modal, Button, TextInput, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateButton from "../components/createButton";
import Icon from "react-native-vector-icons/AntDesign";
import List from "../components/List";
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';



const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
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

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0'); // Adiciona um zero à esquerda se necessário
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() retorna um índice base-0, então adicionamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

const clearAllLists = async () => {
    try {
        await AsyncStorage.clear();
    } catch(e) {
        console.log(e);
    }
}


const HomeScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState('');
    const [keys, setKeys] = useState([]);
    const [lists, setLists] = useState([]);
    const [id, setId] = useState(0);

    getAllKeys = async () => {
        try {
            all = await AsyncStorage.getAllKeys();
            setKeys(all);
        } catch(e) {
            console.log(e);
        }
        return keys;
    }

    const fetchLists = async () => {
        const fetchedKeys = await getAllKeys();
        const fetchedLists = await Promise.all(fetchedKeys.map(key => getData(key)));
        setLists(fetchedLists.filter(list => list !== null));
    };


    useEffect(() => {
        const fetchData = async () => {
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
        if(listName == '') 
        {
                Alert.alert("Nome da lista inválido");
                return;
        }
        const newId = uuid.v4();
        const newDate = formatDate(new Date());
        setId(newId);
        console.log(newId);
        storeData(newId, new List(listName, [], 0, false, newId, newDate));
        setListName('');
        const allKeys = await getAllKeys();
        setKeys(allKeys);
        await fetchLists();
        setModalVisible(false);
        navigation.navigate('List', {name: listName, id: String(newId), date: newDate});
    };
    
    return(
        <SafeAreaView style={{position: "relative", height: "100%", width: "100%", backgroundColor:"#eee"}}>
            
            <View>
                <FlatList
                    data={Object.keys(lists)}
                    renderItem={({item}) =>{

                        if (!lists[item].Deleted)
                            {
                                return(
                                    <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('List', {name: lists[item].Name, id: lists[item].Id})}>
                                        <View >
                                            <View style={{flexDirection: "row", width:"100vw", justifyContent: "space-between", alignItems:"center"}}>
                                                <Text>{lists[item].Name}</Text>
                                                <TouchableOpacity onPress={async () => {
                                                    const deletedList = lists[item];
                                                    deletedList.Deleted = true;
                                                    console.log(deletedList);
                                                    storeData(deletedList.Id, deletedList);
                                                    await fetchLists();
                                                }}>
                                                    <Icon name="delete" size={24} color="#e22"/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:15}}>
                                            <Text style={{fontSize:10, color:"#bbb"}}>{lists[item].Items.length} items</Text>
                                            <Text style={{fontSize:10, color:"#bbb"}}>{lists[item].Date}</Text>
                                            <Text style={{color:"#2b2", fontSize:10, fontWeight:"bold"}}>${lists[item].TotalPrice}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            } 
                        }
                    }
                    keyExtractor={(item) => item}
                    initialNumToRender={10}
                    removeClippedSubviews={true}
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
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={{color:"#bdbdbd"}}>Nome da Lista</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={setListName}
                            value={listName}
                        />
                        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                            <TouchableOpacity onPress={closeModal} title="Fechar">
                                <Icon name="closecircleo" size={50} color="#E15141"></Icon>
                            </TouchableOpacity>
                            <View style={{marginRight:100}}></View>
                            <TouchableOpacity onPress={createList} title="Criar Lista">
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
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
        borderColor: "#ddd"
    },
    listItem: {
        padding: 20,
        borderColor: "#fff",
        borderWidth: 1,
        backgroundColor: "#fff",
        margin: 5,
        borderRadius: 10,
        justifyContent: "space-between",
    }
});

export default HomeScreen;