import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import Vietnamese translations
import viCommon from "./locales/vi/common.json";
import viCatalog from "./locales/vi/catalog.json";
import viGuides from "./locales/vi/guides.json";
import viChat from "./locales/vi/chat.json";
import viMap from "./locales/vi/map.json";

// Import English translations
import enCommon from "./locales/en/common.json";
import enCatalog from "./locales/en/catalog.json";
import enGuides from "./locales/en/guides.json";
import enChat from "./locales/en/chat.json";
import enMap from "./locales/en/map.json";

// Import Korean translations
import koCommon from "./locales/ko/common.json";
import koCatalog from "./locales/ko/catalog.json";
import koGuides from "./locales/ko/guides.json";
import koChat from "./locales/ko/chat.json";
import koMap from "./locales/ko/map.json";

// Import Hindi translations
import hiCommon from "./locales/hi/common.json";
import hiCatalog from "./locales/hi/catalog.json";
import hiGuides from "./locales/hi/guides.json";
import hiChat from "./locales/hi/chat.json";
import hiMap from "./locales/hi/map.json";

// Import Italian translations
import itCommon from "./locales/it/common.json";
import itCatalog from "./locales/it/catalog.json";
import itGuides from "./locales/it/guides.json";
import itChat from "./locales/it/chat.json";
import itMap from "./locales/it/map.json";

// Import Spanish translations
import esCommon from "./locales/es/common.json";
import esCatalog from "./locales/es/catalog.json";
import esGuides from "./locales/es/guides.json";
import esChat from "./locales/es/chat.json";
import esMap from "./locales/es/map.json";

// Import Chinese translations
import zhCommon from "./locales/zh/common.json";
import zhCatalog from "./locales/zh/catalog.json";
import zhGuides from "./locales/zh/guides.json";
import zhChat from "./locales/zh/chat.json";
import zhMap from "./locales/zh/map.json";

const resources = {
  vi: {
    common: viCommon,
    catalog: viCatalog,
    guides: viGuides,
    chat: viChat,
    map: viMap,
  },
  en: {
    common: enCommon,
    catalog: enCatalog,
    guides: enGuides,
    chat: enChat,
    map: enMap,
  },
  ko: {
    common: koCommon,
    catalog: koCatalog,
    guides: koGuides,
    chat: koChat,
    map: koMap,
  },
  hi: {
    common: hiCommon,
    catalog: hiCatalog,
    guides: hiGuides,
    chat: hiChat,
    map: hiMap,
  },
  it: {
    common: itCommon,
    catalog: itCatalog,
    guides: itGuides,
    chat: itChat,
    map: itMap,
  },
  es: {
    common: esCommon,
    catalog: esCatalog,
    guides: esGuides,
    chat: esChat,
    map: esMap,
  },
  zh: {
    common: zhCommon,
    catalog: zhCatalog,
    guides: zhGuides,
    chat: zhChat,
    map: zhMap,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Default language
    fallbackLng: "vi",
    ns: ["common", "catalog", "guides", "chat", "map"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
