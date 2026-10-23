import React from "react";
import { Alert, Platform, Keyboard, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList, SafeAreaView, ScrollView, Modal, StatusBar, Share, useWindowDimensions } from "react-native";
import List from "../components/List";
import { useState, useEffect, useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import Item from "../components/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";
import { useAds } from '../context/AdsContext';
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { multiplyCurrency, formatCurrency, centsToCurrency, isValidCurrency, isValidQuantity } from "../utils/currency";
import { getStoredListEntries, getStoredListResult, saveStoredList } from "../utils/listStorage";
import { createMutationLock } from "../utils/mutationLock";
import { getFirstItemWithoutPriceIndex, getItemsWithoutPriceCount, hasMissingPrice } from "../utils/listPricing";
import { getVisibleFrequentSuggestions, rankFrequentItemSuggestions, removeItemAt, restoreItemAt, toggleItemChecked } from "../utils/listItems";
import { SHARE_MODE_FULL, SHARE_MODE_PENDING, getShareSelection } from "../utils/listSharing";
import { markReviewRequested, recordCompletedList, requestStoreReviewIfAvailable } from "../utils/storeReviewPrompt";
import { normalizeListName, renameList } from "../utils/listNaming";
import * as StoreReview from 'expo-store-review';


const EMPTY_LIST_SUGGESTIONS = [
    'templateItemRice',
    'templateItemBeans',
    'templateItemMilk',
    'templateItemBread',
    'templateItemEggs',
    'templateItemFruit'
];

const MAX_FREQUENT_ITEM_SUGGESTIONS = 6;
const MAX_IN_PROGRESS_FREQUENT_ITEM_SUGGESTIONS = 4;
const STORE_REVIEW_STATE_KEY = 'storeReviewPromptState';

const getFrequentItemSuggestions = async (currentListId) => {
    try {
        const entries = await getStoredListEntries({
            includeDeleted: false,
            excludeKey: currentListId,
            logPrefix: 'Ignoring non-list AsyncStorage key while loading frequent items'
        });

        return rankFrequentItemSuggestions(
            entries.map(({ list }) => list),
            MAX_FREQUENT_ITEM_SUGGESTIONS
        );
    } catch (error) {
        console.log('Error loading frequent item suggestions:', error);
        return [];
    }
}


const ListScreen = ({ route, navigation }) => {
    const { colors } = useTheme();
    const { getText } = useLanguage();
    const { interstitial, isPrivacyFlowActive } = useAds();
    const { height: viewportHeight } = useWindowDimensions();
    const { name, id, date } = route.params;
    const renderListData = () => getStoredListResult(id, { logPrefix: 'Error loading list screen data' });
    //carregar os valores já existentes na lista salva pelo name
    const [list, setList] = useState(new List(name, [], 0, false, id, date));
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [checkList, setCheckList] = useState([]);
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [sortBy, setSortBy] = useState('addition'); // 'addition', 'alphabetical', 'status'
    const [isLoading, setIsLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [listLoadError, setListLoadError] = useState(false);
    const [listUnavailable, setListUnavailable] = useState(false);
    const [frequentItemSuggestions, setFrequentItemSuggestions] = useState([]);
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [editingItemName, setEditingItemName] = useState("");
    const [editingItemPrice, setEditingItemPrice] = useState("");
    const [editingItemQuantity, setEditingItemQuantity] = useState("");
    const [isSavingItemEdit, setIsSavingItemEdit] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [editingListName, setEditingListName] = useState("");
    const [isSavingListName, setIsSavingListName] = useState(false);
    const [isMutatingItems, setIsMutatingItems] = useState(false);
    const [recentlyDeletedItem, setRecentlyDeletedItem] = useState(null);
    const completedDuringVisitRef = useRef(false);
    const reviewPromptedRef = useRef(false);
    const reviewPendingRef = useRef(false);
    const navigationExitRef = useRef(false);
    const flatList = useRef();
    const itemInputRef = useRef();
    const priceInputRef = useRef();
    const quantityInputRef = useRef();
    const shouldScrollAfterAddRef = useRef(false);
    const listRef = useRef(list);
    const itemMutationLockRef = useRef(createMutationLock());

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

    const initializeScreen = async () => {
        setIsLoading(true);
        setListLoadError(false);
        setListUnavailable(false);

        try {
            // Primeiro carrega os dados
            const result = await renderListData();
            if (result.status !== 'ready') {
                setDataLoaded(false);
                setListUnavailable(true);
                setIsLoading(false);
                return;
            }
            listRef.current = result.list;
            setList(result.list);
        } catch (error) {
            console.log('Error initializing list screen:', error);
            setDataLoaded(false);
            setListLoadError(true);
            setIsLoading(false);
            return;
        }

        // Carrega preferência de ordenação
        await loadSortPreference();

        const suggestions = await getFrequentItemSuggestions(id);
        setFrequentItemSuggestions(suggestions);

        // Marca que os dados foram carregados
        setDataLoaded(true);
        setIsLoading(false);
    };

    useEffect(() => {
        initializeScreen();
    }, []);

    useEffect(() => {
        if (!recentlyDeletedItem) {
            return undefined;
        }

        const dismissTimeout = setTimeout(() => setRecentlyDeletedItem(null), 6000);
        return () => clearTimeout(dismissTimeout);
    }, [recentlyDeletedItem]);

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

    // Preload only for an active shopping task. A loaded callback never shows an ad.
    const hasUnfinishedItems = list?.Items?.some((listItem) => !listItem.checked) === true;
    useFocusEffect(
        React.useCallback(() => {
            interstitial.setOpportunityExpected(dataLoaded && hasUnfinishedItems);
            return () => interstitial.setOpportunityExpected(false);
        }, [dataLoaded, hasUnfinishedItems, interstitial])
    );

    useEffect(() => navigation.addListener('beforeRemove', (event) => {
        if (navigationExitRef.current === 'resuming') return;
        if (navigationExitRef.current === 'waiting') { event.preventDefault(); return; }
        const items = listRef.current?.Items;
        const completed = items?.length > 0 && items.every((listItem) => listItem.checked);
        if (!completedDuringVisitRef.current || !completed ||
            reviewPromptedRef.current || reviewPendingRef.current || isMutatingItems || isSavingItemEdit || isSavingListName ||
            sortModalVisible || shareModalVisible || renameModalVisible || editingItemIndex !== null ||
            item.trim() || price.trim() || quantity.trim() || Keyboard.isVisible() || isPrivacyFlowActive()) return;

        if (!interstitial.canShow()) {
            interstitial.tryShow(); // Record a missed opportunity without delaying navigation.
            return;
        }

        event.preventDefault();
        navigationExitRef.current = 'waiting';
        const continueNavigation = () => {
            navigationExitRef.current = 'resuming';
            navigation.dispatch(event.data.action);
        };
        if (!interstitial.tryShow({ onFinished: continueNavigation })) continueNavigation();
    }), [navigation, interstitial, isPrivacyFlowActive, isMutatingItems, isSavingItemEdit,
        isSavingListName, sortModalVisible, shareModalVisible, renameModalVisible, editingItemIndex, item, price, quantity]);



    const addItemToList = async (itemName, itemPrice = '0', itemQuantity = '1', shouldClearInputs = false) => {
        const normalizedItemName = itemName?.trim();

        if (!normalizedItemName) {
            Alert.alert(getText('validNameRequired'));
            return false;
        }

        if (itemPrice && !isValidCurrency(itemPrice)) {
            Alert.alert(getText('invalidPrice'), getText('invalidPriceMessage'));
            return false;
        }

        if (itemQuantity && !isValidQuantity(itemQuantity)) {
            Alert.alert(getText('invalidQuantity'), getText('invalidQuantityMessage'));
            return false;
        }

        const normalizedPrice = itemPrice || '0';
        const normalizedQuantity = itemQuantity || '1';

        const newItem = new Item(normalizedItemName, normalizedPrice, normalizedQuantity);
        const savedList = await runListMutation(
            (currentList) => ({
                ...currentList,
                Items: [...currentList.Items, newItem],
            }),
            'Error saving added item:'
        );

        if (savedList && shouldClearInputs) {
            setItem("");
            setPrice("");
            setQuantity("");
        }

        return Boolean(savedList);
    }

    const addItem = async () => {
        const itemAdded = await addItemToList(item, price, quantity, true);
        if (itemAdded) {
            requestScrollAfterAddedItem();
            itemInputRef.current?.focus();
        }
    }

    const addSuggestedItem = async (itemKey) => {
        const itemAdded = await addItemToList(getText(itemKey));
        if (itemAdded) {
            requestScrollAfterAddedItem();
        }
    }

    const addFrequentItem = async (itemName) => {
        const itemAdded = await addItemToList(itemName);
        if (itemAdded) {
            requestScrollAfterAddedItem();
        }
    }

    const requestScrollAfterAddedItem = () => {
        if (sortBy === 'addition') {
            shouldScrollAfterAddRef.current = true;
        }
    };

    const scrollAfterAddedItemLayout = () => {
        if (!shouldScrollAfterAddRef.current) {
            return;
        }

        shouldScrollAfterAddRef.current = false;
        flatList.current?.scrollToEnd({ animated: true });
    };

    const visibleFrequentItemSuggestions = getVisibleFrequentSuggestions(
        list?.Items,
        frequentItemSuggestions,
        MAX_FREQUENT_ITEM_SUGGESTIONS
    );

    const renderFrequentSuggestions = (suggestions, compact = false) => (
        <View
            style={[
                styles.frequentSuggestionSection,
                compact && styles.frequentSuggestionSectionCompact,
            ]}
            testID={compact ? 'in-progress-frequent-suggestions' : 'empty-frequent-suggestions'}
        >
            <Text style={[styles.frequentSuggestionsTitle, { color: colors.text }]}>
                {getText('frequentItemSuggestionsTitle')}
            </Text>
            {!compact && (
                <Text style={[styles.frequentSuggestionsSubtitle, { color: colors.textSecondary }]}>
                    {getText('frequentItemSuggestionsSubtitle')}
                </Text>
            )}
            <View style={styles.quickSuggestionsGrid}>
                {suggestions.map((frequentItem) => (
                    <TouchableOpacity
                        key={frequentItem}
                        style={[styles.quickSuggestionChip, { backgroundColor: colors.surface, borderColor: colors.borderLight, opacity: isMutatingItems ? 0.5 : 1 }]}
                        onPress={() => addFrequentItem(frequentItem)}
                        disabled={isMutatingItems}
                        accessibilityRole="button"
                        accessibilityLabel={`${getText('addFrequentItem')}: ${frequentItem}`}
                        accessibilityState={{ disabled: isMutatingItems, busy: isMutatingItems }}
                    >
                        <Icon name="pluscircleo" size={16} color={colors.primary} />
                        <Text style={[styles.quickSuggestionText, { color: colors.text }]} numberOfLines={1}>
                            {frequentItem}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.listEmptyContainer}>
            <Icon name="filetext1" size={68} color={colors.textTertiary}></Icon>
            <Text style={[styles.listEmptyTitle, { color: colors.text }]}>{getText('listEmptyTitle')}</Text>
            <Text style={[styles.listEmptySubtitle, { color: colors.textSecondary }]}>
                {getText('listEmptySubtitle')}
            </Text>
            {visibleFrequentItemSuggestions.length > 0 && (
                renderFrequentSuggestions(visibleFrequentItemSuggestions)
            )}
            <Text style={[styles.quickSuggestionsTitle, { color: colors.text }]}>{getText('quickAddSuggestions')}</Text>
            <View style={styles.quickSuggestionsGrid}>
                {EMPTY_LIST_SUGGESTIONS.map((itemKey) => (
                    <TouchableOpacity
                        key={itemKey}
                        style={[styles.quickSuggestionChip, { backgroundColor: colors.surface, borderColor: colors.borderLight, opacity: isMutatingItems ? 0.5 : 1 }]}
                        onPress={() => addSuggestedItem(itemKey)}
                        disabled={isMutatingItems}
                        accessibilityRole="button"
                        accessibilityLabel={`${getText('addSuggestedItem')}: ${getText(itemKey)}`}
                        accessibilityState={{ disabled: isMutatingItems, busy: isMutatingItems }}
                    >
                        <Icon name="pluscircleo" size={16} color={colors.primary} />
                        <Text style={[styles.quickSuggestionText, { color: colors.text }]} numberOfLines={1}>
                            {getText(itemKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

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

    const openShareOptions = () => {
        if (!list?.Items?.length) {
            Alert.alert(getText('emptyListMessage'));
            return;
        }

        setShareModalVisible(true);
    };

    const shareList = async (mode) => {
        try {
            const selection = getShareSelection(list?.Items, mode);
            if (selection.items.length === 0) {
                setShareModalVisible(false);
                Alert.alert(getText('noPendingItemsTitle'), getText('noPendingItemsMessage'));
                return;
            }

            setShareModalVisible(false);

            let message = mode === SHARE_MODE_PENDING
                ? `${list.Name}\n${getText('sharePendingHeading')}\n\n`
                : `${list.Name}\n\n`;

            selection.items.forEach((item) => {
                const checkMark = item.checked ? '☑' : '☐';
                const itemTotal = multiplyCurrency(item.priceCents, item.quantity);
                message += `${checkMark} ${item.name}\n`;
                message += hasMissingPrice(item)
                    ? `   ${getText('pricePending')} · ${item.quantity}x\n`
                    : `   ${formatCurrency(item.priceCents)} x ${item.quantity} = ${formatCurrency(itemTotal)}\n`;
            });

            if (mode === SHARE_MODE_PENDING) {
                message += `\n${getText('toBuyTotal')}: ${formatCurrency(selection.pendingTotal)}`;
            } else {
                message += `\n${getText('inCartTotal')}: ${formatCurrency(selection.checkedTotal)}\n`;
                message += `${getText('toBuyTotal')}: ${formatCurrency(selection.pendingTotal)}\n`;
                message += `${getText(selection.missingPriceCount > 0 ? 'totalPartial' : 'totalPrice')}: ${formatCurrency(selection.total)}`;
            }

            if (selection.missingPriceCount > 0) {
                message += `\n${getText(selection.missingPriceCount === 1 ? 'itemWithoutPrice' : 'itemsWithoutPrice', { 0: selection.missingPriceCount })}`;
            }

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
        let removalResult = null;
        const savedList = await runListMutation((currentList) => {
            removalResult = removeItemAt(currentList.Items, index);
            if (!removalResult) {
                return null;
            }

            return {
                ...currentList,
                Items: removalResult.items,
            };
        }, 'Error saving removed item:');

        if (savedList && removalResult) {
            setRecentlyDeletedItem({
                item: removalResult.removedItem,
                index: removalResult.index,
            });
        }
    }

    const undoRemoveItem = async () => {
        const deletionToUndo = recentlyDeletedItem;
        if (!deletionToUndo) {
            return;
        }

        const savedList = await runListMutation((currentList) => {
            const restoredItems = restoreItemAt(
                currentList.Items,
                deletionToUndo.item,
                deletionToUndo.index
            );

            return restoredItems ? { ...currentList, Items: restoredItems } : null;
        }, 'Error restoring removed item:');

        if (savedList) {
            setRecentlyDeletedItem(null);
        }
    };

    const openItemEditor = (itemToEdit) => {
        const originalIndex = list.Items.findIndex((listItem) => listItem === itemToEdit);
        if (originalIndex < 0) {
            return;
        }

        setEditingItemIndex(originalIndex);
        setEditingItemName(itemToEdit.name || "");
        setEditingItemPrice(centsToCurrency(itemToEdit.priceCents || 0));
        setEditingItemQuantity(String(itemToEdit.quantity || 1));
    };

    const reviewFirstMissingPrice = () => {
        const pendingItemIndex = getFirstItemWithoutPriceIndex(list?.Items);
        const pendingItem = list?.Items?.[pendingItemIndex];

        if (pendingItem) {
            openItemEditor(pendingItem);
        }
    };

    const runListMutation = async (createNextList, errorLogMessage) => {
        if (!itemMutationLockRef.current.tryAcquire()) {
            return null;
        }

        setIsMutatingItems(true);

        try {
            const nextList = createNextList(listRef.current);
            if (!nextList) {
                return null;
            }

            const savedList = await saveStoredList(id, nextList);
            listRef.current = savedList;
            setList(savedList);
            return savedList;
        } catch (error) {
            console.log(errorLogMessage, error);
            Alert.alert(getText('storageErrorTitle'), getText('storageErrorMessage'));
            return null;
        } finally {
            itemMutationLockRef.current.release();
            setIsMutatingItems(false);
        }
    };

    const closeItemEditor = () => {
        if (isSavingItemEdit) {
            return;
        }

        setEditingItemIndex(null);
        setEditingItemName("");
        setEditingItemPrice("");
        setEditingItemQuantity("");
    };

    const openListRenamer = () => {
        setEditingListName(listRef.current?.Name || name || "");
        setRenameModalVisible(true);
    };

    const closeListRenamer = () => {
        if (isSavingListName) {
            return;
        }

        setRenameModalVisible(false);
        setEditingListName("");
    };

    const saveListName = async () => {
        const normalizedName = normalizeListName(editingListName);
        if (!normalizedName) {
            Alert.alert(getText('invalidListName'));
            return;
        }

        setIsSavingListName(true);
        try {
            const savedList = await runListMutation(
                (currentList) => renameList(currentList, normalizedName),
                'Error renaming list:'
            );

            if (savedList) {
                navigation.setParams({ name: savedList.Name });
                setRenameModalVisible(false);
                setEditingListName("");
            }
        } finally {
            setIsSavingListName(false);
        }
    };

    const saveItemEdit = async () => {
        const normalizedName = editingItemName.trim();

        if (!normalizedName) {
            Alert.alert(getText('validNameRequired'));
            return;
        }

        if (!isValidCurrency(editingItemPrice)) {
            Alert.alert(getText('invalidPrice'), getText('invalidPriceMessage'));
            return;
        }

        if (!isValidQuantity(editingItemQuantity)) {
            Alert.alert(getText('invalidQuantity'), getText('invalidQuantityMessage'));
            return;
        }

        const currentItem = listRef.current.Items[editingItemIndex];
        if (!currentItem) {
            closeItemEditor();
            return;
        }

        const updatedItem = new Item(
            normalizedName,
            editingItemPrice || '0',
            editingItemQuantity || '1'
        );
        updatedItem.checked = currentItem.checked === true;

        setIsSavingItemEdit(true);
        try {
            const savedList = await runListMutation((currentList) => ({
                ...currentList,
                Items: currentList.Items.map((listItem, index) => (
                    index === editingItemIndex ? updatedItem : listItem
                )),
            }), 'Error saving edited item:');

            if (savedList) {
                setEditingItemIndex(null);
                setEditingItemName("");
                setEditingItemPrice("");
                setEditingItemQuantity("");
            }
        } finally {
            setIsSavingItemEdit(false);
        }
    };

    const priceCheckItem = async (index) => {
        const savedList = await runListMutation((currentList) => {
            const toggledItems = toggleItemChecked(currentList.Items, index);
            if (!toggledItems) {
                return null;
            }

            return {
                ...currentList,
                Items: toggledItems,
            };
        }, 'Error saving checked item:');

        const listWasCompleted = savedList?.Items?.length > 0 && savedList.Items.every((listItem) => listItem.checked);
        if (listWasCompleted) completedDuringVisitRef.current = true;
        if (!listWasCompleted || Platform.OS === 'web' || isPrivacyFlowActive()) {
            return;
        }

        reviewPendingRef.current = true;
        try {
            const storedState = await AsyncStorage.getItem(STORE_REVIEW_STATE_KEY);
            const parsedState = storedState ? JSON.parse(storedState) : null;
            const result = recordCompletedList(parsedState, savedList.Id);
            await AsyncStorage.setItem(STORE_REVIEW_STATE_KEY, JSON.stringify(result.state));

            if (result.shouldPrompt && navigation.isFocused() && !isPrivacyFlowActive()) {
                // Keep a review request and an interstitial out of the same task transition.
                reviewPromptedRef.current = true;
                const reviewRequested = await requestStoreReviewIfAvailable({
                    hasAction: () => StoreReview.hasAction(),
                    requestReview: () => StoreReview.requestReview(),
                });

                if (reviewRequested) {
                    await AsyncStorage.setItem(
                        STORE_REVIEW_STATE_KEY,
                        JSON.stringify(markReviewRequested(result.state))
                    );
                }
            }
        } catch (error) {
            console.log('Error preparing store review prompt:', error);
        } finally {
            reviewPendingRef.current = false;
        }
    };

    const listItemCount = list?.Items?.length || 0;
    const checkedItemCount = list?.Items?.filter((listItem) => listItem.checked).length || 0;
    const uncheckedItemCount = listItemCount - checkedItemCount;
    const itemsWithoutPriceCount = getItemsWithoutPriceCount(list?.Items);
    const hasItemsWithoutPrice = itemsWithoutPriceCount > 0;
    const pricingStatusText = hasItemsWithoutPrice
        ? getText(itemsWithoutPriceCount === 1 ? 'itemWithoutPrice' : 'itemsWithoutPrice', { 0: itemsWithoutPriceCount })
        : '';
    const listDate = list?.Date || date || '';
    const listMeta = listDate
        ? `${listItemCount} ${getText('items')} - ${listDate}`
        : `${listItemCount} ${getText('items')}`;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
                styles.screen,
                { backgroundColor: colors.background },
                Platform.OS === 'web' && { height: viewportHeight, maxHeight: viewportHeight },
            ]}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                {/* Tela de Loading */}
                {isLoading && (
                    <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
                        <Icon name="loading1" size={50} color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>{getText('loading') || 'Carregando...'}</Text>
                    </View>
                )}

                {!isLoading && listLoadError && (
                    <View style={styles.loadErrorContainer} testID="list-storage-error">
                        <Icon name="exclamationcircleo" size={48} color={colors.danger} />
                        <Text style={[styles.loadErrorTitle, { color: colors.text }]}>
                            {getText('storageReadErrorTitle')}
                        </Text>
                        <Text style={[styles.loadErrorMessage, { color: colors.textSecondary }]}>
                            {getText('storageReadErrorMessage')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.loadErrorRetryButton, { backgroundColor: colors.primary }]}
                            onPress={initializeScreen}
                            accessibilityRole="button"
                            accessibilityLabel={getText('tryAgain')}
                            testID="list-storage-retry"
                        >
                            <Icon name="reload1" size={18} color="#fff" />
                            <Text style={styles.loadErrorRetryText}>{getText('tryAgain')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.loadErrorBackButton}
                            onPress={() => navigation.goBack()}
                            accessibilityRole="button"
                            accessibilityLabel={getText('backToLists')}
                        >
                            <Text style={[styles.loadErrorBackText, { color: colors.primary }]}>
                                {getText('backToLists')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!isLoading && listUnavailable && (
                    <View style={styles.loadErrorContainer} testID="list-unavailable">
                        <Icon name="filetext1" size={48} color={colors.textTertiary} />
                        <Text style={[styles.loadErrorTitle, { color: colors.text }]}>
                            {getText('listUnavailableTitle')}
                        </Text>
                        <Text style={[styles.loadErrorMessage, { color: colors.textSecondary }]}>
                            {getText('listUnavailableMessage')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.loadErrorRetryButton, { backgroundColor: colors.primary }]}
                            onPress={initializeScreen}
                            accessibilityRole="button"
                            accessibilityLabel={getText('tryAgain')}
                            testID="list-unavailable-retry"
                        >
                            <Icon name="reload1" size={18} color="#fff" />
                            <Text style={styles.loadErrorRetryText}>{getText('tryAgain')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.loadErrorBackButton}
                            onPress={() => navigation.goBack()}
                            accessibilityRole="button"
                            accessibilityLabel={getText('backToLists')}
                        >
                            <Text style={[styles.loadErrorBackText, { color: colors.primary }]}>
                                {getText('backToLists')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!isLoading && !listLoadError && !listUnavailable && (
                    <>
                        {/* Header contextual da lista */}
                        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                            <View style={styles.headerTopRow}>
                                <TouchableOpacity
                                    style={[styles.backButton, { borderColor: colors.border }]}
                                    onPress={() => navigation.goBack()}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('backToLists')}
                                >
                                    <Icon name="arrowleft" size={22} color={colors.text} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.headerTitleGroup}
                                    onPress={openListRenamer}
                                    disabled={isMutatingItems}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('renameListAccessibilityLabel', { 0: list?.Name || name })}
                                    accessibilityState={{ disabled: isMutatingItems }}
                                >
                                    <View style={styles.headerTitleRow}>
                                        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                                            {list?.Name || name}
                                        </Text>
                                        <Icon name="edit" size={15} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.headerMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {listMeta}
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.headerActions}>
                                    <TouchableOpacity
                                        style={[styles.iconActionButton, { backgroundColor: colors.primary }]}
                                        onPress={() => setSortModalVisible(true)}
                                        accessibilityRole="button"
                                        accessibilityLabel={getText('sortBy')}
                                    >
                                        <Icon name="filter" size={19} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.iconActionButton, { backgroundColor: colors.success }]}
                                        onPress={openShareOptions}
                                        accessibilityRole="button"
                                        accessibilityLabel={getText('shareList')}
                                    >
                                        <Icon name="sharealt" size={19} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.summaryRow}>
                                <View style={[styles.summaryTile, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                                    <Text style={[styles.summaryLabel, { color: colors.textTertiary }]} numberOfLines={1}>
                                        {getText(hasItemsWithoutPrice ? 'totalPartial' : 'totalPrice')}
                                    </Text>
                                    <Text style={[styles.summaryValue, { color: colors.success }]} numberOfLines={1}>
                                        {formatCurrency(list.TotalPrice || 0)}
                                    </Text>
                                </View>
                                <View style={[styles.summaryTile, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                                    <Text style={[styles.summaryLabel, { color: colors.textTertiary }]} numberOfLines={1}>
                                        {getText('toBuyTotal')}
                                    </Text>
                                    <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>
                                        {formatCurrency(list.TotalUncheckedPrice || 0)}
                                    </Text>
                                </View>
                                <View style={[styles.summaryTile, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                                    <Text style={[styles.summaryLabel, { color: colors.textTertiary }]} numberOfLines={1}>
                                        {getText('listProgress')}
                                    </Text>
                                    <Text style={[styles.summaryValue, { color: colors.primary }]} numberOfLines={1}>
                                        {checkedItemCount}/{listItemCount}
                                    </Text>
                                </View>
                            </View>
                            {hasItemsWithoutPrice && (
                                <TouchableOpacity
                                    style={[
                                        styles.pricingNotice,
                                        { backgroundColor: colors.background, borderColor: colors.borderLight },
                                        isMutatingItems && styles.mutationDisabled,
                                    ]}
                                    onPress={reviewFirstMissingPrice}
                                    disabled={isMutatingItems}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${pricingStatusText} ${getText('reviewMissingPrices')}`}
                                    accessibilityState={{ disabled: isMutatingItems, busy: isMutatingItems }}
                                    testID="partial-total-notice"
                                >
                                    <Icon name="infocirlceo" size={15} color={colors.primary} />
                                    <Text style={[styles.pricingNoticeText, { color: colors.textSecondary }]}>
                                        {pricingStatusText}
                                    </Text>
                                    <Text style={[styles.pricingNoticeAction, { color: colors.primary }]}>
                                        {getText('reviewMissingPrices')}
                                    </Text>
                                    <Icon name="right" size={13} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <FlatList
                            ref={flatList}
                            style={styles.itemsList}
                            initialNumToRender={14}
                            keyboardDismissMode="on-drag"
                            data={getSortedItems()}
                            keyExtractor={(item, index) => `${item.name}-${index}`}
                            contentContainerStyle={{ paddingBottom: 80 }}
                            onContentSizeChange={scrollAfterAddedItemLayout}
                            ListHeaderComponent={list?.Items?.length > 0 && visibleFrequentItemSuggestions.length > 0
                                ? renderFrequentSuggestions(
                                    visibleFrequentItemSuggestions.slice(0, MAX_IN_PROGRESS_FREQUENT_ITEM_SUGGESTIONS),
                                    true
                                )
                                : null}
                            renderItem={({ item, index }) => (
                                <View style={styles.itemContainer}>
                                    <View style={[styles.itemBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                                        <TouchableOpacity
                                            style={[styles.itemToggleContent, isMutatingItems && styles.mutationDisabled]}
                                            onPress={() => {
                                                const originalIndex = list.Items.findIndex(listItem => listItem === item);
                                                priceCheckItem(originalIndex);
                                            }}
                                            disabled={isMutatingItems}
                                            accessibilityRole="checkbox"
                                            accessibilityState={{ checked: item.checked, disabled: isMutatingItems, busy: isMutatingItems }}
                                            accessibilityLabel={getText(item.checked ? 'checkedItemAccessibilityLabel' : 'uncheckedItemAccessibilityLabel', { 0: item.name })}
                                            testID={`toggle-item-${index}`}
                                        >
                                            <View style={styles.itemCheckVisual} importantForAccessibility="no-hide-descendants">
                                                {item.checked ?
                                                    <Icon name="checkcircle" size={30} color="#4151E1"></Icon> :
                                                    <View style={[styles.checkCircle, { borderColor: colors.border }]}></View>}
                                            </View>
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
                                                    {hasMissingPrice(item) ? getText('pricePending') : formatCurrency(item.priceCents)}
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
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.itemActionButton, isMutatingItems && styles.mutationDisabled]}
                                            onPress={() => openItemEditor(item)}
                                            disabled={isMutatingItems}
                                            accessibilityRole="button"
                                            accessibilityLabel={getText('editItemAccessibilityLabel', { 0: item.name })}
                                            accessibilityState={{ disabled: isMutatingItems, busy: isMutatingItems }}
                                        >
                                            <Icon name="edit" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.itemActionButton, isMutatingItems && styles.mutationDisabled]}
                                            onPress={() => {
                                                const originalIndex = list.Items.findIndex(listItem => listItem === item);
                                                removeItem(originalIndex);
                                            }}
                                            disabled={isMutatingItems}
                                            accessibilityRole="button"
                                            accessibilityLabel={getText('deleteItemAccessibilityLabel', { 0: item.name })}
                                            accessibilityState={{ disabled: isMutatingItems, busy: isMutatingItems }}
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
                                                {getText('inCartTotal')}: {formatCurrency(list.TotalCheckedPrice || 0)}
                                            </Text>
                                            <Text style={{ color: colors.success, fontWeight: "bold" }}> + </Text>
                                            <Text style={{ color: colors.success, fontWeight: "bold" }}>
                                                {getText('toBuyTotal')}: {formatCurrency(list.TotalUncheckedPrice || 0)}
                                            </Text>
                                        </View>
                                        <Text style={{ color: colors.success, fontWeight: "bold" }}>
                                            {getText(hasItemsWithoutPrice ? 'totalPartial' : 'totalPrice')}: {formatCurrency(list.TotalPrice || 0)}
                                        </Text>
                                        {hasItemsWithoutPrice && (
                                            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                                                {pricingStatusText}
                                            </Text>
                                        )}
                                    </View> : null
                            )}
                            ListEmptyComponent={renderEmptyList}
                        />
                        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                            <View style={styles.itemNameField}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    {getText('itemNameLabel')}
                                </Text>
                                <TextInput
                                    ref={itemInputRef}
                                    placeholder={getText('itemPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={item}
                                    onChangeText={(text) => setItem(text)}
                                    style={[styles.itemInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                                    accessibilityLabel={getText('itemNameLabel')}
                                    returnKeyType="next"
                                    onSubmitEditing={() => priceInputRef.current?.focus()}
                                    blurOnSubmit={false}
                                />
                            </View>
                            <View style={styles.itemDetailsRow}>
                                <View style={styles.itemValueField}>
                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        {getText('itemPriceLabel')}
                                    </Text>
                                    <TextInput
                                        ref={priceInputRef}
                                        placeholder={getText('pricePlaceholder')}
                                        placeholderTextColor={colors.textTertiary}
                                        value={price}
                                        onChangeText={(text) => setPrice(text)}
                                        style={[styles.itemValueInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                                        accessibilityLabel={getText('itemPriceLabel')}
                                        keyboardType="decimal-pad"
                                        returnKeyType="next"
                                        onSubmitEditing={() => quantityInputRef.current?.focus()}
                                        blurOnSubmit={false}
                                    />
                                </View>
                                <View style={styles.itemQuantityField}>
                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        {getText('itemQuantityLabel')}
                                    </Text>
                                    <TextInput
                                        ref={quantityInputRef}
                                        placeholder={getText('quantityPlaceholder')}
                                        placeholderTextColor={colors.textTertiary}
                                        value={quantity}
                                        onChangeText={(text) => setQuantity(text)}
                                        style={[styles.itemValueInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                                        accessibilityLabel={getText('itemQuantityLabel')}
                                        keyboardType="decimal-pad"
                                        returnKeyType="done"
                                        onSubmitEditing={addItem}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={addItem}
                                    disabled={isMutatingItems}
                                    style={[
                                        styles.addItemButton,
                                        { backgroundColor: colors.primary },
                                        isMutatingItems && styles.mutationDisabled,
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('addItemAccessibilityLabel')}
                                    accessibilityState={{ disabled: isMutatingItems, busy: isMutatingItems }}
                                >
                                    <Icon name="plus" size={20} color="#fff" />
                                    <Text style={styles.addItemButtonText} numberOfLines={1}>
                                        {getText('addItemButtonLabel')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {recentlyDeletedItem && (
                            <View
                                style={[styles.undoBanner, { backgroundColor: colors.text }]}
                                accessibilityRole="alert"
                                testID="item-delete-undo-banner"
                            >
                                <Text style={[styles.undoBannerText, { color: colors.background }]} numberOfLines={2}>
                                    {getText('itemDeletedMessage', { 0: recentlyDeletedItem.item.name })}
                                </Text>
                                <TouchableOpacity
                                    style={styles.undoBannerButton}
                                    onPress={undoRemoveItem}
                                    disabled={isMutatingItems}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('undo')}
                                    accessibilityState={{ disabled: isMutatingItems, busy: isMutatingItems }}
                                    testID="item-delete-undo"
                                >
                                    <Text style={[styles.undoBannerButtonText, { color: colors.primary }]}>
                                        {getText('undo')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* Modal de compartilhamento */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={shareModalVisible}
                    onRequestClose={() => setShareModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.shareModalContent, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{getText('shareList')}</Text>
                            <Text style={[styles.shareModalSubtitle, { color: colors.textSecondary }]}>
                                {getText('shareOptionsDescription')}
                            </Text>

                            <TouchableOpacity
                                style={[styles.shareOption, { borderColor: colors.border }]}
                                onPress={() => shareList(SHARE_MODE_PENDING)}
                                accessibilityRole="button"
                                accessibilityLabel={getText('sharePendingOption', { 0: uncheckedItemCount })}
                                testID="share-pending-option"
                            >
                                <Icon name="shoppingcart" size={22} color={colors.primary} />
                                <View style={styles.shareOptionTextGroup}>
                                    <Text style={[styles.shareOptionTitle, { color: colors.text }]}>
                                        {getText('sharePendingOption', { 0: uncheckedItemCount })}
                                    </Text>
                                    <Text style={[styles.shareOptionDescription, { color: colors.textSecondary }]}>
                                        {getText('sharePendingDescription')}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.shareOption, { borderColor: colors.border }]}
                                onPress={() => shareList(SHARE_MODE_FULL)}
                                accessibilityRole="button"
                                accessibilityLabel={getText('shareFullOption')}
                                testID="share-full-option"
                            >
                                <Icon name="profile" size={22} color={colors.primary} />
                                <View style={styles.shareOptionTextGroup}>
                                    <Text style={[styles.shareOptionTitle, { color: colors.text }]}>
                                        {getText('shareFullOption')}
                                    </Text>
                                    <Text style={[styles.shareOptionDescription, { color: colors.textSecondary }]}>
                                        {getText('shareFullDescription')}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.shareModalCancel}
                                onPress={() => setShareModalVisible(false)}
                                accessibilityRole="button"
                                accessibilityLabel={getText('cancel')}
                            >
                                <Text style={[styles.shareModalCancelText, { color: colors.primary }]}>
                                    {getText('cancel')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
                                accessibilityRole="button"
                                accessibilityLabel={getText('sortByAddition')}
                                accessibilityState={{ selected: sortBy === 'addition' }}
                            >
                                <Text style={[styles.sortOptionText, { color: colors.text }]}>{getText('sortByAddition')}</Text>
                                {sortBy === 'addition' && <Icon name="check" size={20} color={colors.primary} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortOption, sortBy === 'alphabetical' && { backgroundColor: colors.primary + '20' }]}
                                onPress={() => handleSortChange('alphabetical')}
                                accessibilityRole="button"
                                accessibilityLabel={getText('sortByAlphabetical')}
                                accessibilityState={{ selected: sortBy === 'alphabetical' }}
                            >
                                <Text style={[styles.sortOptionText, { color: colors.text }]}>{getText('sortByAlphabetical')}</Text>
                                {sortBy === 'alphabetical' && <Icon name="check" size={20} color={colors.primary} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortOption, sortBy === 'status' && { backgroundColor: colors.primary + '20' }]}
                                onPress={() => handleSortChange('status')}
                                accessibilityRole="button"
                                accessibilityLabel={getText('sortByStatus')}
                                accessibilityState={{ selected: sortBy === 'status' }}
                            >
                                <Text style={[styles.sortOptionText, { color: colors.text }]}>{getText('sortByStatus')}</Text>
                                {sortBy === 'status' && <Icon name="check" size={20} color={colors.primary} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.closeModalButton, { backgroundColor: colors.textTertiary }]}
                                onPress={() => setSortModalVisible(false)}
                                accessibilityRole="button"
                                accessibilityLabel={getText('close')}
                            >
                                <Text style={styles.closeModalButtonText}>{getText('close')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={renameModalVisible}
                    onRequestClose={closeListRenamer}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {getText('renameListTitle')}
                            </Text>
                            <Text style={[styles.editModalSubtitle, { color: colors.textSecondary }]}>
                                {getText('renameListSubtitle')}
                            </Text>
                            <TextInput
                                value={editingListName}
                                onChangeText={setEditingListName}
                                placeholder={getText('listNameExample')}
                                placeholderTextColor={colors.textTertiary}
                                style={[styles.editModalInput, { borderColor: colors.border, color: colors.text }]}
                                accessibilityLabel={getText('listNamePlaceholder')}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={saveListName}
                            />
                            <View style={styles.editModalActions}>
                                <TouchableOpacity
                                    style={[styles.editModalButton, { borderColor: colors.border }]}
                                    onPress={closeListRenamer}
                                    disabled={isSavingListName}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('cancel')}
                                >
                                    <Text style={[styles.editModalSecondaryText, { color: colors.text }]}>
                                        {getText('cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.editModalButton, { backgroundColor: colors.primary }]}
                                    onPress={saveListName}
                                    disabled={isSavingListName || !editingListName.trim()}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('saveChanges')}
                                    accessibilityState={{ disabled: isSavingListName || !editingListName.trim(), busy: isSavingListName }}
                                >
                                    <Text style={styles.editModalPrimaryText}>
                                        {getText(isSavingListName ? 'savingChanges' : 'saveChanges')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={editingItemIndex !== null}
                    onRequestClose={closeItemEditor}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {getText('editItemTitle')}
                            </Text>
                            <Text style={[styles.editModalSubtitle, { color: colors.textSecondary }]}>
                                {getText('editItemSubtitle')}
                            </Text>
                            <TextInput
                                value={editingItemName}
                                onChangeText={setEditingItemName}
                                placeholder={getText('itemPlaceholder')}
                                placeholderTextColor={colors.textTertiary}
                                style={[styles.editModalInput, { borderColor: colors.border, color: colors.text }]}
                                accessibilityLabel={getText('itemPlaceholder')}
                                autoFocus
                                returnKeyType="next"
                            />
                            <View style={styles.editModalValueRow}>
                                <TextInput
                                    value={editingItemPrice}
                                    onChangeText={setEditingItemPrice}
                                    placeholder={getText('pricePlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    style={[styles.editModalValueInput, { borderColor: colors.border, color: colors.text }]}
                                    accessibilityLabel={getText('pricePlaceholder')}
                                    keyboardType="decimal-pad"
                                />
                                <TextInput
                                    value={editingItemQuantity}
                                    onChangeText={setEditingItemQuantity}
                                    placeholder={getText('quantityPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    style={[styles.editModalValueInput, { borderColor: colors.border, color: colors.text }]}
                                    accessibilityLabel={getText('quantityPlaceholder')}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={styles.editModalActions}>
                                <TouchableOpacity
                                    style={[styles.editModalButton, { borderColor: colors.border }]}
                                    onPress={closeItemEditor}
                                    disabled={isSavingItemEdit}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('cancel')}
                                >
                                    <Text style={[styles.editModalSecondaryText, { color: colors.text }]}>
                                        {getText('cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.editModalButton, { backgroundColor: colors.primary }]}
                                    onPress={saveItemEdit}
                                    disabled={isSavingItemEdit}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('saveChanges')}
                                    accessibilityState={{ disabled: isSavingItemEdit }}
                                >
                                    <Text style={styles.editModalPrimaryText}>
                                        {getText(isSavingItemEdit ? 'savingChanges' : 'saveChanges')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
    },
    safeArea: {
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 42,
        height: 42,
        borderWidth: 1,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    headerTitleGroup: {
        flex: 1,
        minWidth: 0,
    },
    headerTitle: {
        flexShrink: 1,
        fontSize: 19,
        fontWeight: '700',
        lineHeight: 24,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerMeta: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 10,
    },
    iconActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    summaryTile: {
        flex: 1,
        minWidth: 0,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 3,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    pricingNotice: {
        minHeight: 34,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        marginTop: 8,
    },
    pricingNoticeText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
        marginLeft: 7,
    },
    pricingNoticeAction: {
        fontSize: 12,
        fontWeight: '700',
        marginHorizontal: 7,
    },
    inputContainer: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderTopWidth: 1,
    },
    itemsList: {
        flex: 1,
        minHeight: 0,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
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
        borderWidth: 1,
        borderRadius: 15,
        minHeight: 60,
        overflow: 'hidden',
    },
    itemToggleContent: {
        flex: 1,
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        paddingVertical: 10,
    },
    itemCheckVisual: {
        width: 30,
        height: 30,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
    itemActionButton: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mutationDisabled: {
        opacity: 0.5,
    },
    undoBanner: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 170,
        zIndex: 20,
        minHeight: 52,
        borderRadius: 12,
        paddingLeft: 16,
        paddingRight: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    undoBannerText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '600',
    },
    undoBannerButton: {
        minWidth: 72,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    undoBannerButtonText: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    itemInput: {
        width: '100%',
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 12,
    },
    itemNameField: {
        width: '100%',
    },
    itemDetailsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    itemValueField: {
        flex: 1,
        minWidth: 0,
    },
    itemQuantityField: {
        width: 84,
    },
    inputLabel: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemValueInput: {
        width: '100%',
        minHeight: 48,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 12,
    },
    addItemButton: {
        minWidth: 112,
        minHeight: 48,
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    addItemButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
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
    shareModalContent: {
        width: '88%',
        maxWidth: 420,
        borderRadius: 20,
        padding: 24,
    },
    shareModalSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: -12,
        marginBottom: 18,
    },
    shareOption: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    shareOptionTextGroup: {
        flex: 1,
        marginLeft: 12,
    },
    shareOptionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    shareOptionDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 3,
    },
    shareModalCancel: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    shareModalCancelText: {
        fontSize: 15,
        fontWeight: '700',
    },
    editModalContent: {
        width: '88%',
        maxWidth: 420,
        borderRadius: 20,
        padding: 24,
    },
    editModalSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: -12,
        marginBottom: 18,
    },
    editModalInput: {
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    editModalValueRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    editModalValueInput: {
        flex: 1,
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    editModalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    editModalButton: {
        flex: 1,
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    editModalPrimaryText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    editModalSecondaryText: {
        fontSize: 15,
        fontWeight: '700',
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
    loadErrorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    loadErrorTitle: {
        fontSize: 21,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 18,
        marginBottom: 8,
    },
    loadErrorMessage: {
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'center',
    },
    loadErrorRetryButton: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingHorizontal: 18,
        marginTop: 20,
    },
    loadErrorRetryText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
    loadErrorBackButton: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginTop: 8,
    },
    loadErrorBackText: {
        fontSize: 15,
        fontWeight: '700',
    },
    listEmptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 120,
    },
    listEmptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 18,
        marginBottom: 8,
        textAlign: 'center',
    },
    listEmptySubtitle: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
        maxWidth: 310,
    },
    frequentSuggestionSection: {
        width: '100%',
        marginBottom: 18,
    },
    frequentSuggestionSectionCompact: {
        paddingHorizontal: 10,
        paddingTop: 10,
        marginBottom: 8,
    },
    frequentSuggestionsTitle: {
        alignSelf: 'flex-start',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    frequentSuggestionsSubtitle: {
        alignSelf: 'flex-start',
        fontSize: 12,
        lineHeight: 17,
        marginBottom: 10,
    },
    quickSuggestionsTitle: {
        alignSelf: 'flex-start',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
    },
    quickSuggestionsGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    quickSuggestionChip: {
        width: '48%',
        minHeight: 44,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickSuggestionText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
})

export default ListScreen;
