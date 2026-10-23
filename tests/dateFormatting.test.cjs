const test = require('node:test');
const assert = require('node:assert/strict');
const {
    LANGUAGE_DATE_LOCALES,
    formatLocalizedDate,
    getDateLocale,
} = require('../src/utils/dateFormatting');

test('maps every supported app language to a valid regional date locale', () => {
    assert.deepEqual(LANGUAGE_DATE_LOCALES, {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        cn: 'zh-CN',
    });
    assert.equal(getDateLocale('unsupported'), 'en-US');
});

test('formats trash dates with the selected app language', () => {
    const date = new Date(2026, 7, 20, 12, 0, 0);

    for (const [languageCode, locale] of Object.entries(LANGUAGE_DATE_LOCALES)) {
        assert.equal(
            formatLocalizedDate(date, languageCode),
            date.toLocaleDateString(locale),
            `Expected ${languageCode} to use ${locale}`
        );
    }

    assert.notEqual(formatLocalizedDate(date, 'pt'), formatLocalizedDate(date, 'en'));
});

test('does not render missing or invalid trash dates', () => {
    assert.equal(formatLocalizedDate(null, 'pt'), '');
    assert.equal(formatLocalizedDate('not-a-date', 'fr'), '');
});
