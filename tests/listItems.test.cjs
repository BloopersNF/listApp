const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getVisibleFrequentSuggestions,
    rankFrequentItemSuggestions,
    removeItemAt,
    restoreItemAt,
    toggleItemChecked,
} = require('../src/utils/listItems');

test('toggles only the selected item without mutating the input', () => {
    const firstItem = { name: 'Rice', checked: false };
    const secondItem = { name: 'Milk', checked: true };
    const items = [firstItem, secondItem];

    const toggledItems = toggleItemChecked(items, 0);

    assert.deepEqual(toggledItems, [
        { name: 'Rice', checked: true },
        secondItem,
    ]);
    assert.notEqual(toggledItems, items);
    assert.notEqual(toggledItems[0], firstItem);
    assert.equal(toggledItems[1], secondItem);
    assert.equal(firstItem.checked, false);
});

test('treats a missing checked value as unchecked', () => {
    assert.deepEqual(
        toggleItemChecked([{ name: 'Bread' }], 0),
        [{ name: 'Bread', checked: true }]
    );
});

test('rejects invalid item collections and indexes', () => {
    assert.equal(toggleItemChecked(null, 0), null);
    assert.equal(toggleItemChecked([], 0), null);
    assert.equal(toggleItemChecked([{ name: 'Eggs' }], -1), null);
    assert.equal(toggleItemChecked([{ name: 'Eggs' }], 1), null);
});

test('removes one item immutably and preserves enough data to undo', () => {
    const rice = { name: 'Rice' };
    const milk = { name: 'Milk' };
    const bread = { name: 'Bread' };
    const items = [rice, milk, bread];

    const result = removeItemAt(items, 1);

    assert.deepEqual(result, {
        items: [rice, bread],
        removedItem: milk,
        index: 1,
    });
    assert.deepEqual(items, [rice, milk, bread]);
    assert.notEqual(result.items, items);
});

test('restores a removed item at its original position without mutating the list', () => {
    const rice = { name: 'Rice' };
    const milk = { name: 'Milk' };
    const bread = { name: 'Bread' };
    const items = [rice, bread];

    const restoredItems = restoreItemAt(items, milk, 1);

    assert.deepEqual(restoredItems, [rice, milk, bread]);
    assert.deepEqual(items, [rice, bread]);
    assert.notEqual(restoredItems, items);
});

test('clamps restore position and rejects invalid removal or restore input', () => {
    const item = { name: 'Eggs' };

    assert.deepEqual(restoreItemAt([], item, 5), [item]);
    assert.equal(restoreItemAt(null, item, 0), null);
    assert.equal(restoreItemAt([], null, 0), null);
    assert.equal(restoreItemAt([], item, -1), null);
    assert.equal(removeItemAt([], 0), null);
    assert.equal(removeItemAt([item], 1), null);
});

test('keeps frequent suggestions missing from the current list and respects the limit', () => {
    const items = [{ name: ' Rice ' }, { name: 'Milk' }];
    const suggestions = ['rice', 'Bread', 'Eggs', 'bread', 'Fruit'];

    assert.deepEqual(
        getVisibleFrequentSuggestions(items, suggestions, 2),
        ['Bread', 'Eggs']
    );
});

test('returns no frequent suggestions for invalid input or a non-positive limit', () => {
    assert.deepEqual(getVisibleFrequentSuggestions([], null), []);
    assert.deepEqual(getVisibleFrequentSuggestions([], ['Bread'], 0), []);
});

test('ranks an item at most once per list and keeps frequency and name ordering stable', () => {
    const lists = [
        { Items: [{ name: 'Milk' }, { name: ' milk ' }, { name: 'Bread' }] },
        { Items: [{ name: 'milk' }, { name: 'Eggs' }] },
        { Items: [{ name: 'Bread' }, { name: 'Eggs' }] },
    ];

    assert.deepEqual(rankFrequentItemSuggestions(lists), ['Bread', 'Eggs', 'Milk']);
});
