const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getFirstItemWithoutPriceIndex,
    getItemsWithoutPriceCount,
    hasMissingPrice,
} = require('../src/utils/listPricing');

test('counts zero, missing and invalid prices as pending', () => {
    const items = [
        { priceCents: 1299 },
        { priceCents: 0 },
        {},
        { priceCents: Number.NaN },
    ];

    assert.equal(getItemsWithoutPriceCount(items), 3);
});

test('keeps positive prices out of the pending count', () => {
    assert.equal(hasMissingPrice({ priceCents: 1 }), false);
    assert.equal(hasMissingPrice({ priceCents: 0 }), true);
    assert.equal(getItemsWithoutPriceCount(null), 0);
});

test('finds the first item that needs a price', () => {
    const items = [
        { name: 'Rice', priceCents: 1299 },
        { name: 'Milk', priceCents: 0 },
        { name: 'Bread' },
    ];

    assert.equal(getFirstItemWithoutPriceIndex(items), 1);
    assert.equal(getFirstItemWithoutPriceIndex([{ priceCents: 1 }]), -1);
    assert.equal(getFirstItemWithoutPriceIndex(null), -1);
});
