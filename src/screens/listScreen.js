import React from "react";
import {Platform, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList, SafeAreaView, ScrollView} from "react-native";
import List from "../components/List";
import { useState, useEffect, useRef } from "react";
import Item from "../components/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";


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
    const [quantity, setQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [checkList, setCheckList] = useState([]);

    //percorrer a lista atual para verificar os items que estão com o check true
    const checkItems = () => {
        list.Items.map((item) => {
            if(item.checked == true){
                setCheckList([...checkList, item]);
            }
        })
    }

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
        /*if(item === "" || price === "" || quantity === "") {
            alert("Preencha todos os campos para adicionar um item.");
            return;
        }*/
        list.Items.push(new Item(item, price, quantity)); // adiciona um item na lista
        const newList = {...list}; // cria uma nova cópia do estado atual
        setList(newList); // atualiza o estado com a nova lista
        setItem("");
        setPrice("");
        setQuantity("");
        await storeData(name, newList);
        flatList.current.scrollToEnd()
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
    const flatList = useRef();



return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1, backgroundColor:"#eee"}}>
        <SafeAreaView style={{flex:1, backgroundColor:"#eee"}} >
            <FlatList
                ref ={flatList}
                initialNumToRender={14}
                keyboardDismissMode="none"
                data={list.Items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={{flexDirection: "row", alignItems:"center", justifyContent:"center" }}>
                        <TouchableOpacity style={{margin:5}} onPress={() => { item.checked = !item.checked; setList({...list}); storeData(name, list) }}>
                            {item.checked ?
                            <Icon name="checkcircle" size={30} color="#4151E1"></Icon>:
                            <View style={styles.checkCircle}></View>}
                        </TouchableOpacity>

                        <View key={index} style={styles.itemBox}>
                            <View style={styles.description}>
                                <Text numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                            </View>
                            <View style={styles.description}>
                                <Text numberOfLines={1} ellipsizeMode="tail">${item.price}</Text>
                            </View>
                            <View style={styles.description}>
                                <Text numberOfLines={1} ellipsizeMode="tail">{item.quantity}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeItem(index)}>
                                <Icon name="delete" size={20} color="#f00"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListFooterComponent={() => (
                    list.Items.length > 0 ?
                    <View style={{alignItems:"center", justifyContent:"center", margin:10}}>
                        <Text style={{color:"#2a2"}}>Total: $ {list.TotalPrice}</Text>
                        <Text style={{color:"#2a2"}}>Total marcados: $ {list.TotalPrice}</Text>
                        <Text style={{color:"#2a2"}}>Total desmarcados: $ {list.TotalPrice}</Text>
                    </View> : null
                )}
                ListEmptyComponent={() => (
                    <View style={{alignItems:"center", justifyContent:"center", margin:100}}>
                        <Icon name="filetext1" size={80} color="#bbb"></Icon>
                        <Text style={{color:"#bbb", marginTop:20}} >Sua lista está vazia.</Text>
                    </View>
                )
                }
                />
                <View>
                    <View style={{flexDirection: "row", alignItems:"center", justifyContent:"space-evenly"}}>
                        <TextInput
                            placeholder="Item"
                            value={item}
                            onChangeText={(text) => setItem(text)}
                            style={styles.itemInput}
                        />
                        <TextInput
                            initialValue={0}
                            placeholder="preço"
                            value={price}
                            onChangeText={(text) => setPrice(text)}
                            style={styles.itemPrice}
                            keyboardType="numeric"
                        />
                        <TextInput
                            initialValue={1}
                            placeholder="n"
                            value={quantity}
                            onChangeText={(text) => setQuantity(text)}
                            style={styles.itemPrice}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity onPress={addItem}>
                            <Icon name="pluscircle" size={30} color="#2e2"></Icon>
                        </TouchableOpacity>
                    </View>
                </View>
        </SafeAreaView>
    </KeyboardAvoidingView>
);
}
styles = StyleSheet.create({
    checkCircle: {
        width: 30,
        height: 30,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    itemBox: {
        flex:1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        margin: 5,
        borderColor: "#fff",
        borderWidth: 1,
        borderRadius: "50vh",
        backgroundColor: "#fff",
    },
    itemInput: {
        width: "50%",
        padding: 10,
        borderColor: "#fff",
        borderWidth: 1,
        margin:5,
        borderRadius: "50vh",
        backgroundColor:"#fff"

    },
    itemPrice: {
        width: "15%",
        padding: 10,
        borderColor: "#fff",
        borderWidth: 1,
        margin:5,
        borderRadius: "50vh",
        backgroundColor:"#fff",
        alignItems: "center",
        

    },
    description: {
        width: "25%",
        padding: 0,
        borderColor: "#fff",
        backgroundColor:"#fff"
    }
})

export default ListScreen;