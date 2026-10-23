import AsyncStorage from "@react-native-async-storage/async-storage";
import { centsToCurrency, currencyToCents } from "./currency";

export const CURRENT_LIST_SCHEMA_VERSION = 2;

export const USER_CONFIG_KEYS = new Set([
    'isDarkMode',
    'selectedLanguage',
    'languageMode',
    'listScreenVisitCount',
    'listSortPreference',
    'storeReviewPromptState',
    'adsDiagnostics',
    'adsFrequencyState',
    'userPreferences',
    'appSettings'
]);

export const normalizeItemName = (itemName) => String(itemName || '').trim().toLocaleLowerCase();

export const isUserConfigKey = (key) => !key || USER_CONFIG_KEYS.has(key);

export const isValidStoredList = (value) => (
    value &&
    typeof value === 'object' &&
    typeof value.Id === 'string' &&
    typeof value.Name === 'string' &&
    value.Name.trim() !== '' &&
    Array.isArray(value.Items)
);

const normalizeQuantity = (quantity) => {
    const parsedQuantity = typeof quantity === 'number'
        ? quantity
        : parseFloat(String(quantity || '').replace(',', '.'));

    return Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
};

const normalizePriceCents = (item) => {
    if (Number.isFinite(item.priceCents) && item.priceCents >= 0) {
        return Math.round(item.priceCents);
    }

    return currencyToCents(item.price);
};

export const normalizeStoredItem = (item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
    }

    const priceCents = normalizePriceCents(item);

    return {
        ...item,
        name: String(item.name || '').trim(),
        price: item.price == null || item.price === ''
            ? centsToCurrency(priceCents)
            : String(item.price),
        priceCents,
        quantity: normalizeQuantity(item.quantity),
        checked: item.checked === true,
    };
};

export const normalizeStoredList = (list) => {
    if (!isValidStoredList(list)) {
        return null;
    }

    const normalizedItems = list.Items
        .map(normalizeStoredItem)
        .filter(Boolean);

    const totals = normalizedItems.reduce((result, item) => {
        const itemTotal = Math.round(item.priceCents * item.quantity);
        result.total += itemTotal;

        if (item.checked) {
            result.checked += itemTotal;
        } else {
            result.unchecked += itemTotal;
        }

        return result;
    }, { total: 0, checked: 0, unchecked: 0 });

    return {
        ...list,
        SchemaVersion: CURRENT_LIST_SCHEMA_VERSION,
        Items: normalizedItems,
        TotalPrice: totals.total,
        TotalCheckedPrice: totals.checked,
        TotalUncheckedPrice: totals.unchecked,
    };
};

export const getStoredListKeys = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter((key) => !isUserConfigKey(key));
};

export const getStoredListResult = async (key, options = {}) => {
    const { includeDeleted = true, logPrefix = 'Ignoring non-list AsyncStorage key' } = options;

    if (isUserConfigKey(key)) {
        return { status: 'invalid-key', list: null };
    }

    let storedValue;
    try {
        storedValue = await AsyncStorage.getItem(key);
    } catch (error) {
        console.log(`${logPrefix}:`, key, error);
        throw error;
    }

    if (storedValue == null) {
        return { status: 'missing', list: null };
    }

    try {
        const parsedValue = normalizeStoredList(JSON.parse(storedValue));
        if (!parsedValue) {
            return { status: 'invalid', list: null };
        }

        if (!includeDeleted && parsedValue.Deleted) {
            return { status: 'deleted', list: null };
        }

        return { status: 'ready', list: parsedValue };
    } catch (error) {
        console.log(`${logPrefix}:`, key, error);
        return { status: 'invalid', list: null };
    }
};

export const getStoredList = async (key, options = {}) => {
    const result = await getStoredListResult(key, options);
    return result.list;
};

export const getStoredListEntries = async (options = {}) => {
    const { excludeKey, includeDeleted = true, logPrefix } = options;
    const listKeys = await getStoredListKeys();
    const entries = await Promise.all(
        listKeys
            .filter((key) => key !== excludeKey)
            .map(async (key) => {
                const list = await getStoredList(key, { includeDeleted, logPrefix });
                return list ? { key, list } : null;
            })
    );

    return entries.filter(Boolean);
};

export const saveStoredList = async (key, list) => {
    if (typeof key !== 'string' || key.trim() === '') {
        throw new Error('A valid list storage key is required');
    }

    const normalizedList = normalizeStoredList(list);
    if (!normalizedList) {
        throw new Error('A valid list is required');
    }

    await AsyncStorage.setItem(key, JSON.stringify(normalizedList));
    return normalizedList;
};
