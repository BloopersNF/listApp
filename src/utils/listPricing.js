const hasMissingPrice = (item) => (
    !Number.isFinite(item?.priceCents) || item.priceCents <= 0
);

const getItemsWithoutPriceCount = (items) => (
    Array.isArray(items) ? items.filter(hasMissingPrice).length : 0
);

const getFirstItemWithoutPriceIndex = (items) => (
    Array.isArray(items) ? items.findIndex(hasMissingPrice) : -1
);

module.exports = { getFirstItemWithoutPriceIndex, getItemsWithoutPriceCount, hasMissingPrice };
