import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import lang from "../langs/lang";

const resources = Object.keys(lang.languages).reduce((acc, code) => {
    acc[code] = { translation: lang.languages[code] };
    return acc;
}, {});

if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: "en",
            lng: "en",
            compatibilityJSON: "v3",
            interpolation: {
                escapeValue: false,
            },
        });
}

export default i18n;
