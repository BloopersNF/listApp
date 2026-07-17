import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_CONFIG_KEYS = new Set([
    'isDarkMode',
    'selectedLanguage',
    'languageMode',
    'listScreenVisitCount',
    'listSortPreference',
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

export const getStoredListKeys = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter((key) => !isUserConfigKey(key));
};

export const getStoredList = async (key, options = {}) => {
    const { includeDeleted = true, logPrefix = 'Ignoring non-list AsyncStorage key' } = options;

    if (isUserConfigKey(key)) {
        return null;
    }

    try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue == null) {
            return null;
        }

        const parsedValue = JSON.parse(storedValue);
        if (!isValidStoredList(parsedValue)) {
            return null;
        }

        if (!includeDeleted && parsedValue.Deleted) {
            return null;
        }

        return parsedValue;
    } catch (error) {
        console.log(`${logPrefix}:`, key, error);
        return null;
    }
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
