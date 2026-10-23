const SHARE_MODE_FULL = 'full';
const SHARE_MODE_PENDING = 'pending';

const getItemTotal = (item) => {
    const priceCents = Number.isFinite(item?.priceCents) ? item.priceCents : 0;
    const parsedQuantity = typeof item?.quantity === 'number'
        ? item.quantity
        : parseFloat(String(item?.quantity || '').replace(',', '.'));
    const quantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;

    return Math.round(priceCents * quantity);
};

const getShareSelection = (items, mode = SHARE_MODE_FULL) => {
    const sourceItems = Array.isArray(items) ? items : [];
    const selectedItems = mode === SHARE_MODE_PENDING
        ? sourceItems.filter((item) => item?.checked !== true)
        : sourceItems;

    return selectedItems.reduce((selection, item) => {
        const itemTotal = getItemTotal(item);
        const isChecked = item?.checked === true;

        selection.items.push(item);
        selection.total += itemTotal;
        selection.missingPriceCount += Number.isFinite(item?.priceCents) && item.priceCents > 0 ? 0 : 1;

        if (isChecked) {
            selection.checkedTotal += itemTotal;
        } else {
            selection.pendingTotal += itemTotal;
        }

        return selection;
    }, {
        items: [],
        total: 0,
        checkedTotal: 0,
        pendingTotal: 0,
        missingPriceCount: 0,
    });
};

module.exports = {
    SHARE_MODE_FULL,
    SHARE_MODE_PENDING,
    getShareSelection,
};
