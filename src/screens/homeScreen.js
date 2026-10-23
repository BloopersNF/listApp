import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Alert, Platform, KeyboardAvoidingView, Text, StyleSheet, View, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator } from "react-native";
import CreateButton from "../components/createButton";
import Icon from "react-native-vector-icons/AntDesign";
import List from "../components/List";
import Item from "../components/Item";
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { formatCurrency } from "../utils/currency";
import { getItemsWithoutPriceCount } from "../utils/listPricing";
import { getListProgress } from "../utils/listProgress";
import { filterListsByName } from "../utils/homeListSearch";
import { getStoredList, getStoredListKeys, saveStoredList } from "../utils/listStorage";

const STARTER_TEMPLATES = [
    {
        titleKey: 'homeTemplateWeeklyTitle',
        descriptionKey: 'homeTemplateWeeklyDescription',
        icon: 'shoppingcart',
        itemKeys: ['templateItemRice', 'templateItemBeans', 'templateItemMilk', 'templateItemBread', 'templateItemEggs', 'templateItemFruit']
    },
    {
        titleKey: 'homeTemplateBbqTitle',
        descriptionKey: 'homeTemplateBbqDescription',
        icon: 'star',
        itemKeys: ['templateItemMeat', 'templateItemCharcoal', 'templateItemGarlicBread', 'templateItemSoda', 'templateItemIce']
    },
    {
        titleKey: 'homeTemplatePharmacyTitle',
        descriptionKey: 'homeTemplatePharmacyDescription',
        icon: 'medicinebox',
        itemKeys: ['templateItemToothpaste', 'templateItemSoap', 'templateItemShampoo', 'templateItemMedicine']
    },
    {
        titleKey: 'homeTemplateCleaningTitle',
        descriptionKey: 'homeTemplateCleaningDescription',
        icon: 'home',
        itemKeys: ['templateItemDetergent', 'templateItemSponge', 'templateItemTrashBags', 'templateItemDisinfectant']
    }
];

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0'); // Adiciona um zero à esquerda se necessário
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() retorna um índice base-0, então adicionamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

const deprecatedCleanCorruptedData = async () => {
    return [];

    try {
        const allKeys = await getStoredListKeys();
        const keysToRemove = [];

        // Keys que são configurações do usuário e não devem ser deletadas
        for (const key of allKeys) {
            // Pular keys de configuração do usuário
            if (!key || key.trim() === '') {
                keysToRemove.push(key);
                continue;
            }

            try {
                const parsedData = await getStoredList(key, { logPrefix: 'Removing corrupted list key' });
                if (!parsedData) {
                    keysToRemove.push(key);
                }
            } catch (parseError) {
                keysToRemove.push(key);
            }
        }

        if (keysToRemove.length > 0) {
            console.log('Removed corrupted keys:', keysToRemove);
        }
    } catch (e) {
        console.log('Error cleaning corrupted data:', e);
    }
}


const HomeScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { getText } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);
    const [listName, setListName] = useState('');
    const [lists, setLists] = useState([]);
    const [id, setId] = useState(0);
    const [isLoadingLists, setIsLoadingLists] = useState(true);
    const [listLoadError, setListLoadError] = useState(false);
    const [creationSource, setCreationSource] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const listNameInputRef = useRef(null);
    const creationLockRef = useRef(false);

    const fetchLists = async () => {
        setIsLoadingLists(true);
        setListLoadError(false);

        try {
            const fetchedKeys = await getStoredListKeys();
            if (!fetchedKeys || fetchedKeys.length === 0) {
                setLists([]);
                return;
            }

            const fetchedLists = await Promise.all(
                fetchedKeys
                    .filter(key => key && key.trim() !== '') // Filtra chaves válidas
                    .map(async (key) => {
                        const data = await getStoredList(key, { includeDeleted: false, logPrefix: 'Error fetching list for home' });
                        if (data &&
                            data.Name &&
                            data.Id &&
                            typeof data.Name === 'string' &&
                            data.Name.trim() !== '') {
                            return data;
                        }
                        return null;
                    })
            );

            const filteredLists = fetchedLists.filter(list =>
                list !== null &&
                list !== undefined &&
                list.Name &&
                list.Name.trim() !== '' &&
                list.Id &&
                !list.Deleted // Não mostrar listas deletadas
            );

            setLists(filteredLists);
        } catch (error) {
            console.log('Error in fetchLists:', error);
            setListLoadError(true);
        } finally {
            setIsLoadingLists(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchLists();
        }, [])
    );

    useEffect(() => {
        if (!modalVisible) {
            return undefined;
        }

        const focusTimer = setTimeout(() => {
            listNameInputRef.current?.focus();
        }, 150);

        return () => clearTimeout(focusTimer);
    }, [modalVisible]);



    const closeModal = () => {
        if (creationLockRef.current) {
            return;
        }

        setModalVisible(false);
    }

    const openCreateModal = () => {
        if (!creationLockRef.current) {
            setModalVisible(true);
        }
    };

    const createList = async (nameOverride = listName, templateItemKeys = [], source = 'manual') => {
        const normalizedListName = nameOverride?.trim();

        if (!normalizedListName) {
            Alert.alert(getText('invalidListName'));
            return false;
        }

        if (creationLockRef.current) {
            return false;
        }

        creationLockRef.current = true;
        setCreationSource(source);

        try {
            const newId = uuid.v4();
            const newDate = formatDate(new Date());

            if (!newId) {
                Alert.alert(getText('errorGeneratingId'));
                return false;
            }

            const starterItems = templateItemKeys.map((itemKey) => new Item(getText(itemKey), '0', '1'));
            const newList = new List(normalizedListName, starterItems, 0, false, newId, newDate);
            console.log('Creating list with ID:', newId);

            await saveStoredList(String(newId), newList);
            setListName('');
            await fetchLists();
            setModalVisible(false);
            navigation.navigate('List', { name: normalizedListName, id: String(newId), date: newDate });
            return true;
        } catch (error) {
            console.log('Error creating list:', error);
            Alert.alert(getText('errorCreatingList'), getText('storageErrorMessage'));
            return false;
        } finally {
            creationLockRef.current = false;
            setCreationSource(null);
        }
    };

    const createTemplateList = (template) => {
        createList(getText(template.titleKey), template.itemKeys, template.titleKey);
    };

    const deleteList = async (list) => {
        try {
            const deletedList = { ...list };
            deletedList.Deleted = true;
            deletedList.DeletedAt = new Date().toISOString();
            await saveStoredList(deletedList.Id, deletedList);
            await fetchLists();
        } catch (error) {
            console.log('Error deleting list:', error);
            Alert.alert(getText('errorDeletingList'), getText('storageErrorMessage'));
        }
    };

    const confirmDeleteList = (list) => {
        Alert.alert(
            getText('deleteListConfirmTitle'),
            getText('deleteListConfirmMessage', { 0: list.Name }),
            [
                { text: getText('cancel'), style: "cancel" },
                { text: getText('moveToTrash'), onPress: () => deleteList(list), style: "destructive" }
            ]
        );
    };

    const renderTemplateGrid = () => (
        <View style={styles.templateGrid}>
            {STARTER_TEMPLATES.map((template) => (
                <TouchableOpacity
                    key={template.titleKey}
                    testID={`template-${template.titleKey}`}
                    style={[
                        styles.templateCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.borderLight,
                            opacity: creationSource && creationSource !== template.titleKey ? 0.5 : 1,
                        }
                    ]}
                    onPress={() => createTemplateList(template)}
                    disabled={creationSource !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`${getText('homeUseTemplate')}: ${getText(template.titleKey)}`}
                    accessibilityState={{
                        disabled: creationSource !== null,
                        busy: creationSource === template.titleKey,
                    }}
                >
                    {creationSource === template.titleKey ? (
                        <ActivityIndicator size="small" color={colors.primary} testID={`template-loading-${template.titleKey}`} />
                    ) : (
                        <Icon name={template.icon} size={22} color={colors.primary} />
                    )}
                    <Text style={[styles.templateTitle, { color: colors.text }]}>{getText(template.titleKey)}</Text>
                    <Text style={[styles.templateDescription, { color: colors.textTertiary }]} numberOfLines={2}>
                        {getText(template.descriptionKey)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderValueProposition = () => (
        <View
            style={[styles.valueProposition, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            testID="home-value-proposition"
        >
            <View style={[styles.valuePropositionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="calculator" size={24} color={colors.primary} />
            </View>
            <View style={styles.valuePropositionCopy}>
                <Text style={[styles.valuePropositionTitle, { color: colors.text }]}>
                    {getText('homeValueTitle')}
                </Text>
                <Text style={[styles.valuePropositionSubtitle, { color: colors.textSecondary }]}>
                    {getText('homeValueSubtitle')}
                </Text>
            </View>
        </View>
    );

    const renderSearch = () => (
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Icon name="search1" size={20} color={colors.textSecondary} />
            <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={getText('homeSearchPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel={getText('homeSearchAccessibilityLabel')}
                testID="home-list-search"
            />
            {searchQuery.length > 0 ? (
                <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={() => setSearchQuery('')}
                    accessibilityRole="button"
                    accessibilityLabel={getText('homeSearchClear')}
                    testID="home-list-search-clear"
                >
                    <Icon name="closecircle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            ) : null}
        </View>
    );

    const renderListHeader = () => (
        <>
            {renderValueProposition()}
            {renderSearch()}
        </>
    );

    const renderSearchEmptyState = () => (
        <View style={styles.searchEmptyState} testID="home-list-search-empty">
            <Icon name="search1" size={42} color={colors.textTertiary} />
            <Text style={[styles.searchEmptyTitle, { color: colors.text }]}>
                {getText('homeSearchNoResultsTitle')}
            </Text>
            <Text style={[styles.searchEmptyMessage, { color: colors.textSecondary }]}>
                {getText('homeSearchNoResultsMessage', { 0: searchQuery.trim() })}
            </Text>
            <TouchableOpacity
                style={[styles.searchEmptyButton, { borderColor: colors.border }]}
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel={getText('homeSearchClear')}
            >
                <Text style={[styles.searchEmptyButtonText, { color: colors.primary }]}>
                    {getText('homeSearchClear')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            {renderValueProposition()}
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="shoppingcart" size={42} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{getText('homeEmptyTitle')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{getText('homeEmptySubtitle')}</Text>

            <TouchableOpacity
                style={[
                    styles.primaryEmptyButton,
                    { backgroundColor: colors.primary, opacity: creationSource ? 0.5 : 1 }
                ]}
                onPress={openCreateModal}
                disabled={creationSource !== null}
                accessibilityRole="button"
                accessibilityLabel={getText('homeCreateBlank')}
                accessibilityState={{ disabled: creationSource !== null }}
            >
                <Icon name="pluscircleo" size={18} color="#fff" />
                <Text style={styles.primaryEmptyButtonText}>{getText('homeCreateBlank')}</Text>
            </TouchableOpacity>

            <Text style={[styles.templateSectionTitle, { color: colors.text }]}>{getText('homeTemplateSectionTitle')}</Text>
            {renderTemplateGrid()}
        </View>
    );

    const renderTemplateFooter = () => (
        <View style={styles.templateFooter} testID="home-template-section">
            <Text style={[styles.templateSectionTitle, { color: colors.text }]}>
                {getText('homeTemplateReturningTitle')}
            </Text>
            <Text style={[styles.templateFooterSubtitle, { color: colors.textSecondary }]}>
                {getText('homeTemplateReturningSubtitle')}
            </Text>
            {renderTemplateGrid()}
        </View>
    );

    const isCreatingList = creationSource !== null;
    const canCreateList = listName.trim().length > 0 && !isCreatingList;
    const visibleLists = filterListsByName(lists, searchQuery);
    const isSearching = searchQuery.trim().length > 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {listLoadError ? (
                <View style={styles.storageRecovery} testID="home-storage-error">
                    <Icon name="exclamationcircleo" size={48} color={colors.danger} />
                    <Text style={[styles.storageRecoveryTitle, { color: colors.text }]}>
                        {getText('storageReadErrorTitle')}
                    </Text>
                    <Text style={[styles.storageRecoveryMessage, { color: colors.textSecondary }]}>
                        {getText('storageReadErrorMessage')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.storageRetryButton, { backgroundColor: colors.primary }]}
                        onPress={fetchLists}
                        accessibilityRole="button"
                        accessibilityLabel={getText('tryAgain')}
                        testID="home-storage-retry"
                    >
                        <Icon name="reload1" size={18} color="#fff" />
                        <Text style={styles.storageRetryButtonText}>{getText('tryAgain')}</Text>
                    </TouchableOpacity>
                </View>
            ) : isLoadingLists ? (
                <View style={styles.storageRecovery} testID="home-loading">
                    <Icon name="loading1" size={44} color={colors.primary} />
                    <Text style={[styles.storageRecoveryMessage, { color: colors.textSecondary }]}>
                        {getText('loading')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={visibleLists}
                renderItem={({ item: list }) => {

                    // Verificações de segurança
                    if (!list || list.Deleted || !list.Name || !list.Id) {
                        return null;
                    }

                    const hasItemsWithoutPrice = getItemsWithoutPriceCount(list.Items) > 0;
                    const progress = getListProgress(list.Items);
                    const progressText = progress.status === 'empty'
                        ? getText('homeListEmpty')
                        : progress.status === 'completed'
                            ? getText('homeListCompleted')
                            : getText('homeListProgress', { 0: progress.completed, 1: progress.total });

                    return (
                        <View
                            style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                        >
                            <TouchableOpacity
                            style={styles.listMainButton}
                            onPress={() => navigation.navigate('List', { name: list.Name, id: list.Id })}
                            accessibilityRole="button"
                            accessibilityLabel={`${list.Name}. ${progressText}. ${getText(hasItemsWithoutPrice ? 'totalPartial' : 'totalPrice')}: ${formatCurrency(list.TotalPrice || 0)}`}
                        >
                            <View style={styles.listContent}>
                                <View style={styles.listHeader}>
                                    <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
                                        {list.Name}
                                    </Text>
                                </View>
                                <View style={styles.progressRow}>
                                    <Text
                                        style={[
                                            styles.progressText,
                                            { color: progress.status === 'completed' ? colors.success : colors.textSecondary }
                                        ]}
                                    >
                                        {progressText}
                                    </Text>
                                    {progress.total > 0 ? (
                                        <View
                                            style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}
                                            accessibilityRole="progressbar"
                                            accessibilityValue={{
                                                min: 0,
                                                max: progress.total,
                                                now: progress.completed,
                                                text: progressText,
                                            }}
                                        >
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        backgroundColor: progress.status === 'completed' ? colors.success : colors.primary,
                                                        width: `${progress.ratio * 100}%`,
                                                    }
                                                ]}
                                            />
                                        </View>
                                    ) : null}
                                </View>
                                <View style={styles.listFooter}>
                                    <Text style={[styles.listInfo, { color: colors.textTertiary }]}>
                                        {list.Items?.length || 0} {getText('items')}
                                    </Text>
                                    <Text style={[styles.listDate, { color: colors.textTertiary }]}>
                                        {list.Date || ''}
                                    </Text>
                                    <Text style={[styles.listPrice, { color: "#2b2" }]}>
                                        {getText(hasItemsWithoutPrice ? 'totalPartial' : 'totalPrice')}: {formatCurrency(list.TotalPrice || 0)}
                                    </Text>
                                </View>
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => confirmDeleteList(list)}
                                accessibilityRole="button"
                                accessibilityLabel={`${getText('delete')}: ${list.Name}`}
                            >
                                <Icon name="delete" size={20} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    )
                }}
                keyExtractor={(item) => item.Id}
                initialNumToRender={10}
                removeClippedSubviews={true}
                contentContainerStyle={[styles.listContainer, lists.length === 0 && styles.emptyListContainer]}
                ListEmptyComponent={lists.length === 0 ? renderEmptyState : renderSearchEmptyState}
                    ListHeaderComponent={lists.length > 0 ? renderListHeader : null}
                    ListFooterComponent={lists.length > 0 && !isSearching ? renderTemplateFooter : null}
                />
            )}
            <CreateButton
                method={openCreateModal}
                accessibilityLabel={getText('createList')}
                disabled={isCreatingList}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    closeModal();
                }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <View style={styles.centeredView}>
                        <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {getText('createListModalTitle')}
                            </Text>
                            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                                {getText('createListModalSubtitle')}
                            </Text>
                            <TextInput
                                ref={listNameInputRef}
                                style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                                onChangeText={setListName}
                                value={listName}
                                placeholder={getText('listNameExample')}
                                placeholderTextColor={colors.textSecondary}
                                returnKeyType="done"
                                onSubmitEditing={() => createList()}
                                editable={!isCreatingList}
                                maxLength={50}
                                accessibilityLabel={getText('listNamePlaceholder')}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.secondaryModalButton, { borderColor: colors.border }]}
                                    onPress={closeModal}
                                    disabled={isCreatingList}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('cancel')}
                                    accessibilityState={{ disabled: isCreatingList }}
                                >
                                    <Icon name="close" size={18} color={colors.text} />
                                    <Text style={[styles.secondaryModalButtonText, { color: colors.text }]}>
                                        {getText('cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.primaryModalButton,
                                        { backgroundColor: colors.primary, opacity: canCreateList ? 1 : 0.5 }
                                    ]}
                                    onPress={() => createList()}
                                    disabled={!canCreateList}
                                    accessibilityRole="button"
                                    accessibilityLabel={getText('createList')}
                                    accessibilityState={{ disabled: !canCreateList, busy: isCreatingList }}
                                >
                                    {isCreatingList ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Icon name="check" size={18} color="#fff" />
                                    )}
                                    <Text style={styles.primaryModalButtonText}>
                                        {getText(isCreatingList ? 'savingChanges' : 'createList')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: 100,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: "center",
    },
    valueProposition: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    valuePropositionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    valuePropositionCopy: {
        flex: 1,
    },
    valuePropositionTitle: {
        fontSize: 17,
        lineHeight: 22,
        fontWeight: "700",
        marginBottom: 4,
    },
    valuePropositionSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    searchContainer: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 8,
        paddingLeft: 14,
    },
    searchInput: {
        flex: 1,
        minHeight: 48,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 16,
    },
    clearSearchButton: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    searchEmptyState: {
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 40,
    },
    searchEmptyTitle: {
        fontSize: 19,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 14,
        marginBottom: 6,
    },
    searchEmptyMessage: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
    },
    searchEmptyButton: {
        minHeight: 44,
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 18,
        marginTop: 18,
    },
    searchEmptyButtonText: {
        fontSize: 14,
        fontWeight: "700",
    },
    storageRecovery: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    storageRecoveryTitle: {
        fontSize: 21,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 18,
        marginBottom: 8,
    },
    storageRecoveryMessage: {
        fontSize: 15,
        lineHeight: 21,
        textAlign: "center",
        marginTop: 12,
    },
    storageRetryButton: {
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        paddingHorizontal: 18,
        marginTop: 20,
    },
    storageRetryButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        marginLeft: 8,
    },
    emptyState: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: "center",
    },
    emptyIconContainer: {
        width: 82,
        height: 82,
        borderRadius: 41,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        lineHeight: 21,
        textAlign: "center",
        marginBottom: 20,
        maxWidth: 320,
    },
    primaryEmptyButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 24,
        minHeight: 46,
    },
    primaryEmptyButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        marginLeft: 8,
    },
    templateSectionTitle: {
        alignSelf: "flex-start",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    templateFooter: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    templateFooterSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: -4,
        marginBottom: 14,
    },
    templateGrid: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    templateCard: {
        width: "48%",
        minHeight: 122,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        justifyContent: "space-between",
    },
    templateTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 8,
    },
    templateDescription: {
        fontSize: 12,
        lineHeight: 17,
        marginTop: 6,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        borderRadius: 16,
        padding: 24,
        alignItems: "stretch",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "88%",
        maxWidth: 360,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: 16,
    },
    textInput: {
        minHeight: 46,
        width: "100%",
        marginBottom: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    secondaryModalButton: {
        flex: 1,
        minHeight: 46,
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    primaryModalButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    secondaryModalButtonText: {
        fontSize: 14,
        fontWeight: "700",
        marginLeft: 8,
    },
    primaryModalButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
        marginLeft: 8,
    },
    listItem: {
        borderWidth: 1,
        margin: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    listMainButton: {
        padding: 16,
        paddingRight: 56,
    },
    listContent: {
        flex: 1,
    },
    listHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        marginRight: 12,
    },
    deleteButton: {
        position: "absolute",
        top: 8,
        right: 8,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        width: 44,
        height: 44,
    },
    listFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    progressText: {
        minWidth: 112,
        fontSize: 12,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
        marginRight: 10,
    },
    progressTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
    },
    listInfo: {
        fontSize: 12,
        fontWeight: "500",
    },
    listDate: {
        fontSize: 12,
        fontWeight: "400",
    },
    listPrice: {
        fontSize: 12,
        fontWeight: "bold",
    },
});

export default HomeScreen;
