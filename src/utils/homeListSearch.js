const normalizeSearchText = (value) => String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();

const filterListsByName = (lists, query) => {
    if (!Array.isArray(lists)) {
        return [];
    }

    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
        return lists;
    }

    return lists.filter((list) => (
        list && normalizeSearchText(list.Name).includes(normalizedQuery)
    ));
};

module.exports = {
    filterListsByName,
    normalizeSearchText,
};
