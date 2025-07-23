import React, { useState, useEffect } from "react";
import {SafeAreaView ,Alert, Platform, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, Modal, Button, TextInput, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateButton from "../components/createButton";
import Icon from "react-native-vector-icons/AntDesign";
import List from "../components/List";
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import InterstitialAdManager from "../components/InterstitialAdManager";
import { useTheme } from "../context/ThemeContext";



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
    } catch(e) {
        console.log(e);
    }
}

const cleanCorruptedData = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = [];
        
        for (const key of allKeys) {
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
    } catch(e) {
        console.log('Error cleaning corrupted data:', e);
    }
}


const HomeScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState('');
    const [keys, setKeys] = useState([]);
    const [lists, setLists] = useState([]);
    const [id, setId] = useState(0);

    getAllKeys = async () => {
        try {
            const all = await AsyncStorage.getAllKeys();
            setKeys(all);
            return all;
        } catch(e) {
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
                            return await getData(key);
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
                list.Id
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
        if(!listName || listName.trim() === '') {
            Alert.alert("Nome da lista inválido");
            return;
        }
        
        try {
            const newId = uuid.v4();
            const newDate = formatDate(new Date());
            
            if (!newId) {
                Alert.alert("Erro ao gerar ID da lista");
                return;
            }
            
            const newList = new List(listName.trim(), [], 0, false, newId, newDate);
            console.log('Creating list with ID:', newId);
            
            await storeData(newId, newList);
            setListName('');
            await fetchLists();
            setModalVisible(false);
            navigation.navigate('List', {name: listName.trim(), id: String(newId), date: newDate});
        } catch (error) {
            console.log('Error creating list:', error);
            Alert.alert("Erro ao criar lista");
        }
    };
    
    return(
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={Object.keys(lists)}
                renderItem={({item}) =>{
                    const list = lists[item];
                    
                    // Verificações de segurança
                    if (!list || list.Deleted || !list.Name || !list.Id) {
                        return null;
                    }

                    return(
                        <TouchableOpacity 
                            style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                            onPress={() => navigation.navigate('List', {name: list.Name, id: list.Id})}
                        >
                            <View>
                                <View style={{flexDirection: "row", width:"100%", justifyContent: "space-between", alignItems:"center"}}>
                                    <Text style={{ color: colors.text }} numberOfLines={1}>{list.Name}</Text>
                                    <TouchableOpacity onPress={async () => {
                                        try {
                                            const deletedList = {...list};
                                            deletedList.Deleted = true;
                                            deletedList.DeletedAt = new Date().toISOString();
                                            await storeData(deletedList.Id, deletedList);
                                            await fetchLists();
                                        } catch (error) {
                                            console.log('Error deleting list:', error);
                                        }
                                    }}>
                                        <Icon name="delete" size={24} color="#e22"/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:15}}>
                                <Text style={{fontSize:10, color: colors.textTertiary}}>
                                    {list.Items?.length || 0} items
                                </Text>
                                <Text style={{fontSize:10, color: colors.textTertiary}}>
                                    {list.Date || ''}
                                </Text>
                                <Text style={{color:"#2b2", fontSize:10, fontWeight:"bold"}}>
                                    ${Number(list.TotalPrice || 0).toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item) => item}
                initialNumToRender={10}
                removeClippedSubviews={true}
                contentContainerStyle={{paddingBottom: 100}}
            />     
            <CreateButton method={() => setModalVisible(true)}/>
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
                    <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                        <Text style={{color: colors.textSecondary}}>Nome da Lista</Text>
                        <TextInput
                            style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                            onChangeText={setListName}
                            value={listName}
                            placeholderTextColor={colors.textSecondary}
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
        padding: 20,
        borderWidth: 1,
        margin: 5,
        borderRadius: 10,
        justifyContent: "space-between",
    }
});

export default HomeScreen;