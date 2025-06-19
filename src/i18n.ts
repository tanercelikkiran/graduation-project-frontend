import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import tr from "../translations/tr.json";
import en from "../translations/en.json";
import es from "../translations/es.json";

const resources = {
  tr: {
    translation: tr,
  },
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // varsayılan dil
  fallbackLng: "en", // yedek dil
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
