const toggleItemChecked = (items, index) => {
    if (!Array.isArray(items) || !Number.isInteger(index) || index < 0 || index >= items.length) {
        return null;
    }

    return items.map((item, itemIndex) => (
        itemIndex === index
            ? { ...item, checked: item?.checked !== true }
            : item
    ));
};

const removeItemAt = (items, index) => {
    if (!Array.isArray(items) || !Number.isInteger(index) || index < 0 || index >= items.length) {
        return null;
    }

    return {
        items: items.filter((_, itemIndex) => itemIndex !== index),
        removedItem: items[index],
        index,
    };
};

const restoreItemAt = (items, item, index) => {
    if (!Array.isArray(items) || !item || !Number.isInteger(index) || index < 0) {
        return null;
    }

    const insertionIndex = Math.min(index, items.length);
    return [
        ...items.slice(0, insertionIndex),
        item,
        ...items.slice(insertionIndex),
    ];
};

const normalizeItemName = (itemName) => String(itemName || '').trim().toLocaleLowerCase();

const rankFrequentItemSuggestions = (lists, limit = 6) => {
    if (!Array.isArray(lists) || !Number.isInteger(limit) || limit <= 0) {
        return [];
    }

    const itemFrequency = new Map();

    lists.forEach((list) => {
        const namesSeenInList = new Set();

        (Array.isArray(list?.Items) ? list.Items : []).forEach((item) => {
            const itemName = typeof item?.name === 'string' ? item.name.trim() : '';
            const normalizedName = normalizeItemName(itemName);
            if (!normalizedName || namesSeenInList.has(normalizedName)) {
                return;
            }

            namesSeenInList.add(normalizedName);
            const existingItem = itemFrequency.get(normalizedName) || { name: itemName, count: 0 };
            existingItem.count += 1;
            itemFrequency.set(normalizedName, existingItem);
        });
    });

    return Array.from(itemFrequency.values())
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, limit)
        .map((item) => item.name);
};

const getVisibleFrequentSuggestions = (items, suggestions, limit = 6) => {
    if (!Array.isArray(suggestions) || !Number.isInteger(limit) || limit <= 0) {
        return [];
    }

    const currentItemNames = new Set(
        (Array.isArray(items) ? items : [])
            .filter((item) => typeof item?.name === 'string')
            .map((item) => normalizeItemName(item.name))
            .filter(Boolean)
    );
    const visibleNames = new Set();

    return suggestions.filter((suggestion) => {
        const normalizedSuggestion = normalizeItemName(suggestion);
        if (!normalizedSuggestion || currentItemNames.has(normalizedSuggestion) || visibleNames.has(normalizedSuggestion)) {
            return false;
        }

        visibleNames.add(normalizedSuggestion);
        return true;
    }).slice(0, limit);
};

module.exports = {
    getVisibleFrequentSuggestions,
    rankFrequentItemSuggestions,
    removeItemAt,
    restoreItemAt,
    toggleItemChecked,
};
