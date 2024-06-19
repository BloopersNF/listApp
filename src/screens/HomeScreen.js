import React, { useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity, Modal, Button, TextInput, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


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

    getAllKeys();

    const closeModal = () => {
        setModalVisible(false);
    }
    
    const createList = () => {
        setModalVisible(false);
        navigation.navigate('List', {name: listName});
        setListName('');
    };
    
    return(
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)}><Text>Criar</Text></TouchableOpacity>   
            <FlatList
                data={keys}
                renderItem={({item}) =>
                        <TouchableOpacity onPress={() => navigation.navigate('List', {name: item})}>
                            <View style={{padding: 10, borderColor: "#000", borderWidth: 1}}>
                                <Text>{item}</Text>
                            </View>
                        </TouchableOpacity>

                }
                keyExtractor={(item) => item}
            />     

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
});

export default HomeScreen;