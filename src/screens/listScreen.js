import React from "react";
import {Alert, Platform, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList, SafeAreaView, ScrollView} from "react-native";
import List from "../components/List";
import { useState, useEffect, useRef } from "react";
import Item from "../components/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";
import { TestIds, InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { useTheme } from "../context/ThemeContext";
import { currencyToCents, centsToCurrency, addCurrency, subtractCurrency, multiplyCurrency, formatCurrency, isValidCurrency, isValidQuantity } from "../utils/currency";


const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

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
    const { colors } = useTheme();
    const {name, id, date} = route.params;
    const renderListData = async () => {
        try {
            const listData = await getData(id);
            return listData;
        }
        catch(e) {
            console.log(e);
        }
    }
    //carregar os valores já existentes na lista salva pelo name
    const [list, setList] = useState(new List(name, [], 0, false, id, date));
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [totalPrice, setTotalPrice] = useState(0);
    const [checkList, setCheckList] = useState([]);
    const [loaded, setLoaded] = useState(false);

    //percorrer a lista atual para verificar os items que estão com o check true
    const checkItems = () => {
        if (list?.Items) {
            list.Items.map((item) => {
                if(item.checked == true){
                    setCheckList([...checkList, item]);
                }
            })
        }
    }

    useEffect(() => {
        renderListData().then((data) => {
            if (data != null) {
                setList(data);
            }
        });
    }, []);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        setLoaded(true);
        });

        const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
        if (Platform.OS === 'ios') {
            // Prevent the close button from being unreachable by hiding the status bar on iOS
            StatusBar.setHidden(true);
        }
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        if (Platform.OS === 'ios') {
            StatusBar.setHidden(false);
        }
        });

        // Start loading the interstitial straight away
        interstitial.load();

        // Unsubscribe from events on unmount
        return () => {
        unsubscribeLoaded();
        unsubscribeOpened();
        unsubscribeClosed();
        };
    }, [loaded]);

    useEffect(() => {
        if (loaded) {
            interstitial.show();
        }
    }, [loaded]);



    const addItem = async () => {
        if(item === "") {
            Alert.alert("O item precisa de um nome válido.");
            return;
        }
        
        if (price && !isValidCurrency(price)) {
            Alert.alert("Preço inválido", "Por favor, insira um preço válido.");
            return;
        }
        
        if (quantity && !isValidQuantity(quantity)) {
            Alert.alert("Quantidade inválida", "Por favor, insira uma quantidade válida.");
            return;
        }
        
        const itemPrice = price || '0';
        const itemQuantity = quantity || '1';
        
        const newItem = new Item(item, itemPrice, itemQuantity);
        const itemTotalCents = multiplyCurrency(newItem.priceCents, newItem.quantity);
        
        const newList = {...list};
        newList.TotalPrice = addCurrency(newList.TotalPrice, itemTotalCents);
        newList.TotalUncheckedPrice = addCurrency(newList.TotalUncheckedPrice, itemTotalCents);
        newList.Items.push(newItem);
        
        setList(newList);
        setItem("");
        setPrice("");
        setQuantity("");
        await storeData(id, newList);
        flatList.current?.scrollToEnd();
    }

    const removeItem = async (index) => {
        const newList = {...list}; 
        const itemToRemove = newList.Items[index];
        
        if (itemToRemove) {
            const itemTotalCents = multiplyCurrency(itemToRemove.priceCents, itemToRemove.quantity);
            
            newList.TotalPrice = subtractCurrency(newList.TotalPrice, itemTotalCents);
            
            if (itemToRemove.checked) {
                newList.TotalCheckedPrice = subtractCurrency(newList.TotalCheckedPrice, itemTotalCents);
            } else {
                newList.TotalUncheckedPrice = subtractCurrency(newList.TotalUncheckedPrice, itemTotalCents);
            }
            
            newList.Items.splice(index, 1);
            setList(newList);
            await storeData(id, newList);
        }
    }
    const priceCheckItem = async (index) => {
        const newList = {...list};
        const item = newList.Items[index];
        
        if (item) {
            const itemTotalCents = multiplyCurrency(item.priceCents, item.quantity);
            
            // Toggle the checked status
            newList.Items[index].checked = !newList.Items[index].checked;
            
            if (newList.Items[index].checked) {
                // Item was unchecked, now checked
                newList.TotalCheckedPrice = addCurrency(newList.TotalCheckedPrice, itemTotalCents);
                newList.TotalUncheckedPrice = subtractCurrency(newList.TotalUncheckedPrice, itemTotalCents);
            } else {
                // Item was checked, now unchecked
                newList.TotalCheckedPrice = subtractCurrency(newList.TotalCheckedPrice, itemTotalCents);
                newList.TotalUncheckedPrice = addCurrency(newList.TotalUncheckedPrice, itemTotalCents);
            }
            
            setList(newList);
            await storeData(id, newList);
        }
    }
        

    //console.log(list);
    const flatList = useRef();


return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex:1, backgroundColor: colors.background}}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
        <SafeAreaView style={{flex:1, backgroundColor: colors.background}} >
            <FlatList
                ref ={flatList}
                initialNumToRender={14}
                keyboardDismissMode="on-drag"
                data={list?.Items || []}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{paddingBottom: 80}}
                renderItem={({ item, index }) => (
                    <View style={{flexDirection: "row", alignItems:"center", justifyContent:"center" }}>
                        <TouchableOpacity style={{margin:5}} onPress={() => priceCheckItem(index)}>
                            {item.checked ?
                            <Icon name="checkcircle" size={30} color="#4151E1"></Icon>:
                            <View style={[styles.checkCircle, { borderColor: colors.border }]}></View>}
                        </TouchableOpacity>

                        <View key={index} style={[styles.itemBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                            <View style={styles.description}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.text }}>{item.name}</Text>
                            </View>
                            <View style={styles.description}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.text }}>
                                    {formatCurrency(item.priceCents)}
                                </Text>
                            </View>
                            <View style={styles.description}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.text }}>{item.quantity}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeItem(index)}>
                                <Icon name="delete" size={20} color="#f00"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListFooterComponent={() => (
                    list?.Items?.length > 0 ?
                    <View style={{alignItems:"center", justifyContent:"center", margin:10}}>
                        <View style={{flexDirection: "row"}}>
                            <Text style={{color: colors.success, fontWeight:"bold"}}>
                                Total marcados: {formatCurrency(list.TotalCheckedPrice || 0)}
                            </Text>
                            <Text style={{color: colors.success, fontWeight:"bold"}}> + </Text>
                            <Text style={{color: colors.success, fontWeight:"bold"}}>
                                Total desmarcados: {formatCurrency(list.TotalUncheckedPrice || 0)}
                            </Text>
                        </View>
                        <Text style={{color: colors.success, fontWeight:"bold"}}>
                            Preço total: {formatCurrency(list.TotalPrice || 0)}
                        </Text>
                    </View> : null
                )}
                ListEmptyComponent={() => (
                    <View style={{alignItems:"center", justifyContent:"center", margin:100}}>
                        <Icon name="filetext1" size={80} color={colors.textTertiary}></Icon>
                        <Text style={{color: colors.textTertiary, marginTop:20}} >Sua lista está vazia.</Text>
                    </View>
                )
                }
                />
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <View style={{flexDirection: "row", alignItems:"center", justifyContent:"space-evenly"}}>
                    <TextInput
                        placeholder="Item"
                        placeholderTextColor={colors.textTertiary}
                        value={item}
                        onChangeText={(text) => setItem(text)}
                        style={[styles.itemInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                    />
                    <TextInput
                        placeholder="preço"
                        placeholderTextColor={colors.textTertiary}
                        value={price}
                        onChangeText={(text) => setPrice(text)}
                        style={[styles.itemPrice, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                        keyboardType="numeric"
                    />
                    <TextInput
                        placeholder="qtd"
                        placeholderTextColor={colors.textTertiary}
                        value={quantity}
                        onChangeText={(text) => setQuantity(text)}
                        style={[styles.itemQuantity, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => {addItem()}}>
                        <Icon name="pluscircle" size={30} color="#2e2" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    </KeyboardAvoidingView>
);
}
styles = StyleSheet.create({
    inputContainer: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderTopWidth: 1,
    },
    checkCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    itemBox: {
        flex:1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        margin: 5,
        borderWidth: 1,
        borderRadius: 20,
    },
    itemInput: {
        width: "45%",
        padding: 10,
        borderWidth: 1,
        margin: 5,
        borderRadius: 20,
    },
    itemPrice: {
        width: "20%",
        padding: 10,
        borderWidth: 1,
        margin: 5,
        borderRadius: 20,
        textAlign: "center",
    },
    itemQuantity: {
        width: "10%",
        padding: 10,
        borderWidth: 1,
        margin: 5,
        borderRadius: 20,
        textAlign: "center",
    },
    description: {
        width: "25%",
        padding: 0,
    }
})

export default ListScreen;