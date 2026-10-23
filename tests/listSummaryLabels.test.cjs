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

test('keeps count progress separate from monetary shopping totals in every language', () => {
    for (const languageFile of languageFiles) {
        const source = read(languageFile);

        assert.match(source, /\blistProgress:\s*"[^"]+"/);
        assert.match(source, /\binCartTotal:\s*"[^"]+"/);
        assert.match(source, /\btoBuyTotal:\s*"[^"]+"/);
        assert.doesNotMatch(source, /\btotalChecked:/);
        assert.doesNotMatch(source, /\btotalUnchecked:/);
    }
});

test('uses progress only for item count and monetary labels for currency values', () => {
    const listScreen = read('src/screens/listScreen.js');

    assert.match(
        listScreen,
        /getText\('listProgress'\)[\s\S]{0,300}\{checkedItemCount\}\/\{listItemCount\}/
    );
    assert.doesNotMatch(listScreen, /getText\('listProgress'\)[^\n]*formatCurrency/);
    assert.ok((listScreen.match(/getText\('inCartTotal'\)/g) || []).length >= 2);
    assert.ok((listScreen.match(/getText\('toBuyTotal'\)/g) || []).length >= 3);
    assert.doesNotMatch(listScreen, /getText\('totalChecked'\)/);
    assert.doesNotMatch(listScreen, /getText\('totalUnchecked'\)/);
});
