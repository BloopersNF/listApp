import React from "react";
import { Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList, SafeAreaView} from "react-native";
import List from "../components/List";
import { useState, useEffect } from "react";
import Item from "../components/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { render } from "react-native-web";
import { get, set } from "firebase/database";


const storeData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    }
    catch (e) {
        console.log(e);
        }
    }

const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    }
    catch(e) {
        console.log(e);
    }
}

const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    }
    catch(e) {
        console.log(e);
    }
}


const ListScreen = ({route}) => 
    {
    const {name} = route.params;
    const renderListData = async () => {
        try {
            const listData = await getData(name);
            console.log("listData", listData);
            return listData;
        }
        catch(e) {
            console.log(e);
        }
    }
    //carregar os valores já existentes na lista salva pelo name
    const [list, setList] = useState(new List(name, [], 0));
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
        
    // acessando nome da lista e passando o valor para o header ter o nome da lista
    console.log(name);

    useEffect(() => {
        renderListData().then((data) => {
            if (data != null) {
                setList(data);
            }
        });
    }, []);
    const addItem = async () => {
        list.Items.push(new Item(item, price, 1)); // adiciona um item na lista
        const newList = {...list}; // cria uma nova cópia do estado atual
        setList(newList); // atualiza o estado com a nova lista
        setItem("");
        setPrice("");
        await storeData(name, newList);
    }

    const removeItem = async (index) => {
        list.Items.splice(index, 1); // remove um item da lista
        const newList = {...list}; // cria uma nova cópia do estado atual
        setList(newList); // atualiza o estado com a nova lista
        await storeData(name, newList);
        let datas = await getData(name);
        console.log(datas);
    }

    console.log(list);


    return (
        <SafeAreaView>
            <View>
                <Text>Lista de Compras</Text>
                <FlatList
                    data={list.Items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View key={index}>
                            <Text>{item.name}</Text>
                            <Text>R$ {item.price}</Text>
                            <Text>qtt {item.quantity}</Text>
                            <TouchableOpacity onPress={() => removeItem(index)}>
                                <Text>X</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
                <View>
                    <TextInput
                        placeholder="Item"
                        value={item}
                        onChangeText={(text) => setItem(text)}
                    />
                    <TextInput
                        placeholder="Preço"
                        value={price}
                        onChangeText={(text) => setPrice(text)}
                    />
                    <TouchableOpacity onPress={addItem}>
                        <Text>Adicionar</Text>
                    </TouchableOpacity>
                </View>
                <Text>Total: R$ {list.TotalPrice}</Text>
            </View>
        </SafeAreaView>
    );
}
export default ListScreen;