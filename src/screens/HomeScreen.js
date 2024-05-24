import React, { useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity, Modal, Button, TextInput, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAll } from "firebase/remote-config";


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
                    
                    <Text>{item}</Text>
                }
                keyExtractor={(item) => item}
            />     

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
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