export const normalizeListName = (name) => String(name || '').trim();

export const renameList = (list, nextName) => {
    if (!list || typeof list !== 'object' || Array.isArray(list)) {
        return null;
    }

    const normalizedName = normalizeListName(nextName);
    if (!normalizedName) {
        return null;
    }

    return {
        ...list,
        Name: normalizedName,
    };
};
