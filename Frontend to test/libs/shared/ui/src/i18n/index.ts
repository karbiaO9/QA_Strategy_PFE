import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { fr } from './locales/fr';
import { en } from './locales/en';
import { es } from './locales/es';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});

export default i18n;
