const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const languageFiles = [
    'src/langs/pt-br.js',
    'src/langs/en.js',
    'src/langs/es.js',
    'src/langs/fr.js',
    'src/langs/cn.js',
];

const loadListNaming = () => {
    const source = read('src/utils/listNaming.js')
        .replace(/export const /g, 'const ')
        .concat('\nmodule.exports = { normalizeListName, renameList };');
    const sandbox = { module: { exports: {} } };
    vm.runInNewContext(source, sandbox);
    return sandbox.module.exports;
};

test('renames a list while preserving its identity and contents', () => {
    const { renameList } = loadListNaming();
    const original = {
        Id: 'list-123',
        Name: 'Weekly groceries',
        Date: '02/09/2026',
        Items: [{ name: 'Milk', checked: true, priceCents: 500 }],
        TotalPrice: 500,
    };

    const renamed = renameList(original, '  Weekend groceries  ');

    assert.equal(renamed.Name, 'Weekend groceries');
    assert.equal(renamed.Id, original.Id);
    assert.equal(renamed.Items, original.Items);
    assert.equal(renamed.Date, original.Date);
    assert.equal(renamed.TotalPrice, original.TotalPrice);
    assert.notEqual(renamed, original);
    assert.equal(original.Name, 'Weekly groceries');
});

test('rejects blank names without producing a mutated list', () => {
    const { renameList } = loadListNaming();

    assert.equal(renameList({ Id: 'list-123', Name: 'Groceries', Items: [] }, '   '), null);
    assert.equal(renameList(null, 'Valid name'), null);
});

test('keeps rename copy localized in every supported language', () => {
    for (const languageFile of languageFiles) {
        const source = read(languageFile);

        assert.match(source, /\brenameListTitle:\s*"[^"]+"/);
        assert.match(source, /\brenameListSubtitle:\s*"[^"]+"/);
        assert.match(source, /\brenameListAccessibilityLabel:\s*"[^"]+"/);
    }
});

test('exposes the rename action and persists it through the existing list mutation path', () => {
    const source = read('src/screens/listScreen.js');

    assert.match(source, /accessibilityLabel=\{getText\('renameListAccessibilityLabel'/);
    assert.match(source, /\(currentList\) => renameList\(currentList, normalizedName\)/);
    assert.match(source, /navigation\.setParams\(\{ name: savedList\.Name \}\)/);
    assert.match(source, /disabled=\{isSavingListName \|\| !editingListName\.trim\(\)\}/);
});
