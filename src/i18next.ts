import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr/fr.json';
import en from './locales/en/en.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

const options = {
  order: ['querystring', 'navigator'],
  lookupQuerystring: 'lng',
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    detection: options,
    resources,
    supportedLngs: ['en', 'fr'],
    fallbackLng: 'en',
    debug: false,
  });

export default i18n;
