import React from "react";
import { Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList} from "react-native";
import List from "../components/List";
import { useState, useEffect } from "react";
import Item from "../components/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { get } from "firebase/database";


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
    const [list, setList] = useState(new List(name, [], 0));
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    const [listData, setListData] = useState(null);
        
    // acessando nome da lista e passando o valor para o header ter o nome da lista
    console.log(name);

    const addItem = async () =>
    {
        list.addItem(new Item(item, price, 2));
        setList(list);
        setItem("");
        setPrice("");
        storeData(name, list);
        let datas = await getData(name);
        console.log(datas);
    }

    const removeItem = async (index) =>
    {
        list.removeItem(index);
        setList(list);
        storeData(name ,list);
        let datas = await getData(name);
        console.log(datas);
    }

    return (
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
    );
}
export default ListScreen;