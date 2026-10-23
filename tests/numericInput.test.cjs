const test = require('node:test');
const assert = require('node:assert/strict');
const {
    isValidPriceInput,
    isValidQuantityInput,
    parsePriceInput,
    parseQuantityInput,
} = require('../src/utils/numericInput');

test('accepts optional prices with comma or dot and at most two decimals', () => {
    for (const value of ['', '0', '12', '12,5', '12.50', ' 7,25 ']) {
        assert.equal(isValidPriceInput(value), true, `expected price ${value} to be valid`);
    }

    assert.equal(parsePriceInput('12,50'), 12.5);
});

test('rejects mixed text, signs, grouping and partial price parsing', () => {
    for (const value of ['12abc', '$12', '-1', '+1', '1,234.56', '1.2.3', '1,', '.5', '12.345']) {
        assert.equal(isValidPriceInput(value), false, `expected price ${value} to be invalid`);
    }
});

test('accepts positive quantities with at most three decimal places', () => {
    for (const value of ['', '1', '2,5', '0.125', ' 3.25 ']) {
        assert.equal(isValidQuantityInput(value), true, `expected quantity ${value} to be valid`);
    }

    assert.equal(parseQuantityInput('1,125'), 1.125);
});

test('rejects zero, negative, mixed and ambiguous quantities', () => {
    for (const value of ['0', '0.000', '-1', '2x', '1,2,3', '1.2345', '1,000.5']) {
        assert.equal(isValidQuantityInput(value), false, `expected quantity ${value} to be invalid`);
    }
});
