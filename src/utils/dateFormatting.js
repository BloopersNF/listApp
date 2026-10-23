const LANGUAGE_DATE_LOCALES = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    cn: 'zh-CN',
};

const getDateLocale = (languageCode) => LANGUAGE_DATE_LOCALES[languageCode] || LANGUAGE_DATE_LOCALES.en;

const formatLocalizedDate = (value, languageCode) => {
    if (!value) {
        return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString(getDateLocale(languageCode));
};

module.exports = {
    LANGUAGE_DATE_LOCALES,
    formatLocalizedDate,
    getDateLocale,
};
