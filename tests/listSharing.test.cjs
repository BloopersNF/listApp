const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    SHARE_MODE_FULL,
    SHARE_MODE_PENDING,
    getShareSelection,
} = require('../src/utils/listSharing');

const items = [
    { name: 'Rice', priceCents: 1000, quantity: 2, checked: true },
    { name: 'Milk', priceCents: 450, quantity: 2, checked: false },
    { name: 'Bread', priceCents: 0, quantity: 1, checked: false },
];

test('keeps every item and derives the full-list share totals', () => {
    const selection = getShareSelection(items, SHARE_MODE_FULL);

    assert.deepEqual(selection, {
        items,
        total: 2900,
        checkedTotal: 2000,
        pendingTotal: 900,
        missingPriceCount: 1,
    });
});

test('shares only unchecked items without leaking completed purchases', () => {
    const selection = getShareSelection(items, SHARE_MODE_PENDING);

    assert.deepEqual(selection.items.map((item) => item.name), ['Milk', 'Bread']);
    assert.equal(selection.checkedTotal, 0);
    assert.equal(selection.pendingTotal, 900);
    assert.equal(selection.total, 900);
    assert.equal(selection.missingPriceCount, 1);
});

test('returns an empty pending selection when the purchase is complete', () => {
    const selection = getShareSelection(
        items.map((item) => ({ ...item, checked: true })),
        SHARE_MODE_PENDING
    );

    assert.deepEqual(selection.items, []);
    assert.equal(selection.total, 0);
});

test('handles invalid collections and decimal quantities safely', () => {
    assert.deepEqual(getShareSelection(null, SHARE_MODE_PENDING).items, []);
    assert.equal(getShareSelection([{ priceCents: 399, quantity: '1,5' }]).total, 599);
});

test('keeps both share choices localized in every supported language', () => {
    const languageFiles = ['pt-br.js', 'en.js', 'es.js', 'fr.js', 'cn.js'];
    const requiredKeys = [
        'shareOptionsDescription',
        'sharePendingOption',
        'sharePendingDescription',
        'sharePendingHeading',
        'shareFullOption',
        'shareFullDescription',
        'noPendingItemsTitle',
        'noPendingItemsMessage',
    ];

    for (const languageFile of languageFiles) {
        const source = fs.readFileSync(
            path.resolve(__dirname, '..', 'src', 'langs', languageFile),
            'utf8'
        );

        for (const key of requiredKeys) {
            assert.match(source, new RegExp(`\\b${key}:\\s*"[^"]+"`));
        }
    }
});
