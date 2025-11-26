import React from "react";
import { Alert, Platform, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList, SafeAreaView, ScrollView, Modal, StatusBar, Share } from "react-native";
import List from "../components/List";
import { useState, useEffect, useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import Item from "../components/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";
import { TestIds, InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { addCurrency, subtractCurrency, multiplyCurrency, formatCurrency, isValidCurrency, isValidQuantity } from "../utils/currency";


const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-9404218606533420/6418289792';

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
    catch (e) {
        console.log(e);
    }
}


const ListScreen = ({ route }) => {
    const { colors } = useTheme();
    const { getText } = useLanguage();
    const { name, id, date } = route.params;
    const renderListData = async () => {
        try {
            const listData = await getData(id);
            return listData;
        }
        catch (e) {
            console.log(e);
        }
    }
    //carregar os valores já existentes na lista salva pelo name
    const [list, setList] = useState(new List(name, [], 0, false, id, date));
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [checkList, setCheckList] = useState([]);
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [sortBy, setSortBy] = useState('addition'); // 'addition', 'alphabetical', 'status'
    const [isLoading, setIsLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const adLoadedRef = useRef(false);

    //percorrer a lista atual para verificar os items que estão com o check true
    const checkItems = () => {
        if (list?.Items) {
            list.Items.map((item) => {
                if (item.checked == true) {
                    setCheckList([...checkList, item]);
                }
            })
        }
    }

    useEffect(() => {
        const initializeScreen = async () => {
            // Primeiro carrega os dados
            const data = await renderListData();
            if (data != null) {
                setList(data);
            }

            // Carrega preferência de ordenação
            await loadSortPreference();

            // Marca que os dados foram carregados
            setDataLoaded(true);
            setIsLoading(false);
        };

        initializeScreen();
    }, []);

    const loadSortPreference = async () => {
        try {
            const savedSort = await AsyncStorage.getItem('listSortPreference');
            if (savedSort) {
                setSortBy(savedSort);
            }
        } catch (error) {
            console.log('Error loading sort preference:', error);
        }
    };

    const saveSortPreference = async (newSortBy) => {
        try {
            await AsyncStorage.setItem('listSortPreference', newSortBy);
        } catch (error) {
            console.log('Error saving sort preference:', error);
        }
    };

    const loadAndShowAd = async () => {
        // Não carregar anúncio se já foi carregado nesta sessão ou se os dados não foram carregados
        if (adLoadedRef.current || !dataLoaded) {
            return;
        }

        try {
            // Verificar se AdMob está habilitado antes de carregar anúncio
            if (global.AdMobEnabled) {
                console.log('Carregando anúncio intersticial...');

                const adInstance = InterstitialAd.createForAdRequest(adUnitId, {
                    requestNonPersonalizedAdsOnly: true,
                });

                let adShown = false;

                adInstance.addAdEventListener(AdEventType.LOADED, () => {
                    console.log('Anúncio carregado, mostrando...');
                    adInstance.show();
                    adShown = true;
                    adLoadedRef.current = true;
                });

                adInstance.addAdEventListener(AdEventType.CLOSED, () => {
                    console.log('Anúncio fechado');
                });

                adInstance.addAdEventListener(AdEventType.ERROR, (error) => {
                    console.warn('Erro ao carregar anúncio:', error);
                    adLoadedRef.current = true; // Marca como carregado mesmo com erro
                });

                adInstance.load();

                // Timeout de segurança: se o anúncio não carregar em 3 segundos, marca como carregado
                setTimeout(() => {
                    if (!adShown) {
                        console.log('Timeout: anúncio não carregou a tempo');
                        adLoadedRef.current = true;
                    }
                }, 3000);
            } else {
                console.log('AdMob desabilitado, pulando anúncio intersticial');
                adLoadedRef.current = true;
            }
        } catch (error) {
            console.log('Erro ao carregar anúncio:', error);
            adLoadedRef.current = true;
        }
    };

    // Carregar anúncio apenas na primeira vez que a tela receber foco e após dados carregados
    useFocusEffect(
        React.useCallback(() => {
            if (dataLoaded && !adLoadedRef.current) {
                loadAndShowAd();
            }
        }, [dataLoaded])
    );



    const addItem = async () => {
        if (item === "") {
            Alert.alert(getText('validNameRequired'));
            return;
        }

        if (price && !isValidCurrency(price)) {
            Alert.alert(getText('invalidPrice'), getText('invalidPriceMessage'));
            return;
        }

        if (quantity && !isValidQuantity(quantity)) {
            Alert.alert(getText('invalidQuantity'), getText('invalidQuantityMessage'));
            return;
        }

        const itemPrice = price || '0';
        const itemQuantity = quantity || '1';

        const newItem = new Item(item, itemPrice, itemQuantity);
        const itemTotalCents = multiplyCurrency(newItem.priceCents, newItem.quantity);

        const newList = { ...list };
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

    // Função para ordenar itens
    const getSortedItems = () => {
        if (!list?.Items) return [];

        const items = [...list.Items];

        // Separar itens marcados e não marcados
        const checkedItems = items.filter(item => item.checked);
        const uncheckedItems = items.filter(item => !item.checked);

        // Aplicar ordenação dentro de cada grupo
        const sortItems = (itemsToSort) => {
            switch (sortBy) {
                case 'alphabetical':
                    return itemsToSort.sort((a, b) => a.name.localeCompare(b.name));
                case 'status':
                    return itemsToSort; // Já separados por status
                default: // 'addition'
                    return itemsToSort;
            }
        };

        if (sortBy === 'status') {
            // Mostrar não marcados primeiro, depois marcados embaixo
            return [...sortItems(uncheckedItems), ...sortItems(checkedItems)];
        } else {
            // Misturar todos e aplicar ordenação
            return sortItems(items);
        }
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        saveSortPreference(newSortBy);
        setSortModalVisible(false);
    };

    const shareList = async () => {
        try {
            if (!list || !list.Items || list.Items.length === 0) {
                Alert.alert(getText('emptyListMessage'));
                return;
            }

            let message = `${list.Name}\n`;
            message += `${getText('totalPrice')}: ${formatCurrency(list.TotalPrice || 0)}\n\n`;

            list.Items.forEach((item, index) => {
                const checkMark = item.checked ? '☑' : '☐';
                const itemTotal = multiplyCurrency(item.priceCents, item.quantity);
                message += `${checkMark} ${item.name}\n`;
                message += `   ${formatCurrency(item.priceCents)} x ${item.quantity} = ${formatCurrency(itemTotal)}\n`;
            });

            message += `\n${getText('totalChecked')}: ${formatCurrency(list.TotalCheckedPrice || 0)}\n`;
            message += `${getText('totalUnchecked')}: ${formatCurrency(list.TotalUncheckedPrice || 0)}\n`;
            message += `${getText('totalPrice')}: ${formatCurrency(list.TotalPrice || 0)}`;

            await Share.share({
                message: message,
                title: list.Name
            });
        } catch (error) {
            console.log('Error sharing list:', error);
            Alert.alert(getText('shareError'), getText('shareErrorMessage'));
        }
    };

    const removeItem = async (index) => {
        const newList = { ...list };
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
        const newList = { ...list };
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
            style={{ flex: 1, backgroundColor: colors.background }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} >
                {/* Tela de Loading */}
                {isLoading && (
                    <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
                        <Icon name="loading1" size={50} color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>{getText('loading') || 'Carregando...'}</Text>
                    </View>
                )}

                {!isLoading && (
                    <>
                        {/* Header com botão de ordenação */}
                        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                            <View style={styles.headerButtons}>
                                <TouchableOpacity
                                    style={[styles.sortButton, { backgroundColor: colors.primary }]}
                                    onPress={() => setSortModalVisible(true)}
                                >
                                    <Icon name="filter" size={20} color="#fff" />
                                    <Text style={styles.sortButtonText}>{getText('sortBy')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.shareButton, { backgroundColor: colors.success }]}
                                    onPress={shareList}
                                >
                                    <Icon name="sharealt" size={20} color="#fff" />
                                    <Text style={styles.shareButtonText}>{getText('shareList')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <FlatList
                            ref={flatList}
                            initialNumToRender={14}
                            keyboardDismissMode="on-drag"
                            data={getSortedItems()}
                            keyExtractor={(item, index) => `${item.name}-${index}`}
                            contentContainerStyle={{ paddingBottom: 80 }}
                            renderItem={({ item, index }) => (
                                <View style={styles.itemContainer}>
                                    <TouchableOpacity style={styles.checkButtonContainer} onPress={() => {
                                        const originalIndex = list.Items.findIndex(listItem => listItem === item);
                                        priceCheckItem(originalIndex);
                                    }}>
                                        {item.checked ?
                                            <Icon name="checkcircle" size={30} color="#4151E1"></Icon> :
                                            <View style={[styles.checkCircle, { borderColor: colors.border }]}></View>}
                                    </TouchableOpacity>

                                    <View style={[styles.itemBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                                        <View style={styles.itemNameContainer}>
                                            <Text
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                                style={[
                                                    styles.itemName,
                                                    { color: colors.text },
                                                    item.checked && styles.checkedText
                                                ]}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                        <View style={styles.itemPriceContainer}>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={[
                                                    styles.itemPriceText,
                                                    { color: colors.text },
                                                    item.checked && styles.checkedText
                                                ]}
                                            >
                                                {formatCurrency(item.priceCents)}
                                            </Text>
                                        </View>
                                        <View style={styles.itemQuantityContainer}>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={[
                                                    styles.itemQuantityText,
                                                    { color: colors.text },
                                                    item.checked && styles.checkedText
                                                ]}
                                            >
                                                {item.quantity}x
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => {
                                                const originalIndex = list.Items.findIndex(listItem => listItem === item);
                                                removeItem(originalIndex);
                                            }}
                                        >
                                            <Icon name="delete" size={20} color="#f00" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            ListFooterComponent={() => (
                                list?.Items?.length > 0 ?
                                    <View style={{ alignItems: "center", justifyContent: "center", margin: 10 }}>
                                        <View style={{ flexDirection: "row" }}>
                                            <Text style={{ color: colors.success, fontWeight: "bold" }}>
                                                {getText('totalChecked')}: {formatCurrency(list.TotalCheckedPrice || 0)}
                                            </Text>
                                            <Text style={{ color: colors.success, fontWeight: "bold" }}> + </Text>
                                            <Text style={{ color: colors.success, fontWeight: "bold" }}>
                                                {getText('totalUnchecked')}: {formatCurrency(list.TotalUncheckedPrice || 0)}
                                            </Text>
                                        </View>
                                        <Text style={{ color: colors.success, fontWeight: "bold" }}>
                                            {getText('totalPrice')}: {formatCurrency(list.TotalPrice || 0)}
                                        </Text>
                                    </View> : null
                            )}
                            ListEmptyComponent={() => (
                                <View style={{ alignItems: "center", justifyContent: "center", margin: 100 }}>
                                    <Icon name="filetext1" size={80} color={colors.textTertiary}></Icon>
                                    <Text style={{ color: colors.textTertiary, marginTop: 20 }} >{getText('emptyListMessage')}</Text>
                                </View>
                            )
                            }
                        />
                        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }}>
                                <TextInput
                                    placeholder={getText('itemPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={item}
                                    onChangeText={(text) => setItem(text)}
                                    style={[styles.itemInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                                />
                                <TextInput
                                    placeholder={getText('pricePlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={price}
                                    onChangeText={(text) => setPrice(text)}
                                    style={[styles.itemPrice, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    placeholder={getText('quantityPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={quantity}
                                    onChangeText={(text) => setQuantity(text)}
                                    style={[styles.itemQuantity, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity onPress={() => { addItem() }}>
                                    <Icon name="pluscircle" size={30} color="#2e2" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}

                {/* Modal de ordenação */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={sortModalVisible}
                    onRequestClose={() => setSortModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{getText('sortBy')}</Text>

                            <TouchableOpacity
                                style={[styles.sortOption, sortBy === 'addition' && { backgroundColor: colors.primary + '20' }]}
                                onPress={() => handleSortChange('addition')}
                            >
                                <Text style={[styles.sortOptionText, { color: colors.text }]}>{getText('sortByAddition')}</Text>
                                {sortBy === 'addition' && <Icon name="check" size={20} color={colors.primary} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortOption, sortBy === 'alphabetical' && { backgroundColor: colors.primary + '20' }]}
                                onPress={() => handleSortChange('alphabetical')}
                            >
                                <Text style={[styles.sortOptionText, { color: colors.text }]}>{getText('sortByAlphabetical')}</Text>
                                {sortBy === 'alphabetical' && <Icon name="check" size={20} color={colors.primary} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortOption, sortBy === 'status' && { backgroundColor: colors.primary + '20' }]}
                                onPress={() => handleSortChange('status')}
                            >
                                <Text style={[styles.sortOptionText, { color: colors.text }]}>{getText('sortByStatus')}</Text>
                                {sortBy === 'status' && <Icon name="check" size={20} color={colors.primary} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.closeModalButton, { backgroundColor: colors.textTertiary }]}
                                onPress={() => setSortModalVisible(false)}
                            >
                                <Text style={styles.closeModalButtonText}>{getText('close')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        alignItems: 'flex-end',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sortButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    shareButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderTopWidth: 1,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    checkButtonContainer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        marginLeft: 5,
        borderWidth: 1,
        borderRadius: 15,
        minHeight: 60,
    },
    itemContent: {
        flex: 1,
        marginRight: 10,
    },
    itemNameContainer: {
        flex: 1,
        marginRight: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
    },
    itemPriceContainer: {
        alignItems: 'flex-end',
        marginRight: 10,
    },
    itemPriceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2b2',
    },
    itemQuantityContainer: {
        alignItems: 'center',
        marginRight: 10,
    },
    itemQuantityText: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2b2',
    },
    quantityContainer: {
        marginLeft: 10,
    },
    itemQuantity: {
        fontSize: 14,
        fontWeight: '500',
    },
    checkedText: {
        textDecorationLine: 'line-through',
        fontStyle: 'italic',
        opacity: 0.7,
    },
    deleteButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        minWidth: 280,
        maxWidth: 320,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
    },
    sortOptionText: {
        fontSize: 16,
        flex: 1,
    },
    closeModalButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    closeModalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
    },
})

export default ListScreen;