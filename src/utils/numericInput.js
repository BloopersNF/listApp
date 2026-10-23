const PRICE_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;
const QUANTITY_PATTERN = /^\d+(?:[.,]\d{1,3})?$/;

const parseStrictDecimal = (value, pattern) => {
    const normalizedValue = String(value ?? '').trim();

    if (!pattern.test(normalizedValue)) {
        return null;
    }

    const parsedValue = Number(normalizedValue.replace(',', '.'));
    return Number.isFinite(parsedValue) ? parsedValue : null;
};

const parsePriceInput = (value) => parseStrictDecimal(value, PRICE_PATTERN);
const parseQuantityInput = (value) => parseStrictDecimal(value, QUANTITY_PATTERN);

const isValidPriceInput = (value) => {
    if (value == null || String(value).trim() === '') {
        return true;
    }

    const parsedValue = parsePriceInput(value);
    return parsedValue !== null
        && parsedValue >= 0
        && Math.round(parsedValue * 100) <= Number.MAX_SAFE_INTEGER;
};

const isValidQuantityInput = (value) => {
    if (value == null || String(value).trim() === '') {
        return true;
    }

    const parsedValue = parseQuantityInput(value);
    return parsedValue !== null && parsedValue > 0;
};

module.exports = {
    isValidPriceInput,
    isValidQuantityInput,
    parsePriceInput,
    parseQuantityInput,
};
