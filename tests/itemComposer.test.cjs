const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const languageFiles = [
    'src/langs/pt-br.js',
    'src/langs/en.js',
    'src/langs/es.js',
    'src/langs/fr.js',
    'src/langs/cn.js',
];

test('keeps persistent composer labels localized in every supported language', () => {
    for (const languageFile of languageFiles) {
        const source = read(languageFile);

        assert.match(source, /\bitemNameLabel:\s*"[^"]+"/);
        assert.match(source, /\bitemPriceLabel:\s*"[^"]+"/);
        assert.match(source, /\bitemQuantityLabel:\s*"[^"]+"/);
        assert.match(source, /\baddItemButtonLabel:\s*"[^"]+"/);
    }
});

test('exposes labeled fields, keyboard flow and a 48dp add target', () => {
    const source = read('src/screens/listScreen.js');

    assert.match(source, /accessibilityLabel=\{getText\('itemNameLabel'\)\}/);
    assert.match(source, /accessibilityLabel=\{getText\('itemPriceLabel'\)\}/);
    assert.match(source, /accessibilityLabel=\{getText\('itemQuantityLabel'\)\}/);
    assert.match(source, /onSubmitEditing=\{\(\) => priceInputRef\.current\?\.focus\(\)\}/);
    assert.match(source, /onSubmitEditing=\{\(\) => quantityInputRef\.current\?\.focus\(\)\}/);
    assert.match(source, /addItemButton:\s*\{[\s\S]{0,160}minHeight:\s*48/);
    assert.match(source, /itemsList:\s*\{[\s\S]{0,100}flex:\s*1[\s\S]{0,100}minHeight:\s*0/);
    assert.match(source, /Platform\.OS === 'web' && \{ height: viewportHeight, maxHeight: viewportHeight \}/);
    assert.match(source, /screen:\s*\{[\s\S]{0,120}overflow:\s*'hidden'/);
});

test('waits for the new list content size before scrolling to the added item', () => {
    const source = read('src/screens/listScreen.js');

    assert.match(source, /shouldScrollAfterAddRef\.current = true/);
    assert.match(source, /if \(sortBy === 'addition'\)/);
    assert.match(source, /onContentSizeChange=\{scrollAfterAddedItemLayout\}/);
    assert.doesNotMatch(source, /if \(itemAdded\) \{\s*flatList\.current\?\.scrollToEnd/);
});
