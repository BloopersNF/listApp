const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { filterListsByName, normalizeSearchText } = require('../src/utils/homeListSearch');

const root = path.resolve(__dirname, '..');
const languageFiles = [
    'src/langs/pt-br.js',
    'src/langs/en.js',
    'src/langs/es.js',
    'src/langs/fr.js',
    'src/langs/cn.js',
];

test('normalizes case, surrounding spaces and accents', () => {
    assert.equal(normalizeSearchText('  FARMÁCIA  '), 'farmacia');
});

test('filters list names without changing the original order', () => {
    const lists = [
        { Id: '1', Name: 'Compra da semana' },
        { Id: '2', Name: 'Farmácia' },
        { Id: '3', Name: 'Farmácia mensal' },
    ];

    assert.deepEqual(filterListsByName(lists, 'farmacia'), [lists[1], lists[2]]);
    assert.equal(filterListsByName(lists, ''), lists);
});

test('handles invalid collections and list entries safely', () => {
    assert.deepEqual(filterListsByName(null, 'compra'), []);
    assert.deepEqual(filterListsByName([null, { Name: 'Compra' }], 'compra'), [{ Name: 'Compra' }]);
});

test('keeps search labels localized and an actionable empty state', () => {
    for (const languageFile of languageFiles) {
        const source = fs.readFileSync(path.join(root, languageFile), 'utf8');
        assert.match(source, /\bhomeSearchPlaceholder:\s*"[^"]+"/);
        assert.match(source, /\bhomeSearchClear:\s*"[^"]+"/);
        assert.match(source, /\bhomeSearchNoResultsTitle:\s*"[^"]+"/);
        assert.match(source, /\bhomeSearchNoResultsMessage:\s*"[^"]+"/);
    }

    const homeSource = fs.readFileSync(path.join(root, 'src/screens/homeScreen.js'), 'utf8');
    assert.match(homeSource, /testID="home-list-search"/);
    assert.match(homeSource, /testID="home-list-search-clear"/);
    assert.match(homeSource, /testID="home-list-search-empty"/);
    assert.match(homeSource, /minHeight:\s*48/);
});
