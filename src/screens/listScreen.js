import React from "react";
import { Text, StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import List from "../components/List";
import { useState } from "react";
import Item from "../components/Item";

const ListScreen = ({route}) => 
{
    const {name} = route.params;
    const [list, setList] = useState(new List(name, [], 0));
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    // acessando nome da lista e passando o valor para o header ter o nome da lista
    console.log(name);

    const addItem = () =>
    {
        list.addItem(new Item(item, price, 2));
        setList(list);
        setItem("");
        setPrice("");
        console.log(list);
    }

    const removeItem = (index) =>
    {
        list.removeItem(index);
        setList(list);
    }

    return (
        <View >
            <Text >Lista de Compras</Text>
            <View >
                {
                    list.Items.map((item, index) => 
                    {
                        return (
                            <View key={index}>
                                <Text >{item.name}</Text>
                                <Text >R$ {item.price}</Text>
                                <Text >qtt {item.quantity}</Text>
                                <TouchableOpacity onPress={() => removeItem(index)}>
                                    <Text >X</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    })
                }
            </View>
            <View >
                <TextInput placeholder="Item" value={item} onChangeText={(text) => setItem(text)}/>
                <TextInput  placeholder="Preço" value={price} onChangeText={(text) => setPrice(text)}/>
                <TouchableOpacity onPress={addItem}>
                    <Text >Adicionar</Text>
                </TouchableOpacity>
            </View>
            <Text >Total: R$ {list.TotalPrice}</Text>
        </View>
    )    
}
export default ListScreen;