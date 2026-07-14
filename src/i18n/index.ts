import { pt } from './dictionaries/pt';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';

export type Locale = 'pt' | 'en' | 'es';

const dictionaries = {
  pt,
  en,
  es,
};

export const getDictionary = (locale: Locale) => {
  return dictionaries[locale] || dictionaries.pt;
};

export type Dictionary = typeof pt;
