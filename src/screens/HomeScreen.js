import React, { useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity, Modal, Button, TextInput } from "react-native";

const HomeScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState('');

    const createList = () => {
        setModalVisible(false);
        navigation.navigate('List', {name: listName});
        setListName('');
    };

    return(
        <View>
            <Text>Home</Text>    
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={styles.add}>
                    <Text>Criar</Text>
                </View>
            </TouchableOpacity>        

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
    add: {
        backgroundColor: 'blue',
        padding: 10,
        margin: 10,
        alignItems: 'center',
        borderRadius: 10
    }
});

export default HomeScreen;