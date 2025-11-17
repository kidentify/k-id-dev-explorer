import enTranslations from '../translations/en.json';
import jaTranslations from '../translations/ja.json';
import koTranslations from '../translations/ko.json';
import zhTranslations from '../translations/zh.json';

type TranslationKey = 
  | 'common'
  | 'header'
  | 'widget'
  | 'fields'
  | 'placeholders'
  | 'ageTypes'
  | 'ageCategories'
  | 'flows'
  | 'widgetOptions'
  | 'tunnel'
  | 'events'
  | 'errors';

type Translations = typeof enTranslations;

const translations: Record<string, Translations> = {
  en: enTranslations,
  ja: jaTranslations,
  ko: koTranslations,
  zh: zhTranslations,
};

/**
 * Get the current locale from environment variable or default to 'en'
 * NEXT_PUBLIC_ prefix makes it available on both client and server in Next.js
 */
export function getLocale(): string {
  // In Next.js, NEXT_PUBLIC_ env vars are available on both client and server
  // They are replaced at build time, so we can safely access them
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCALE) {
    return process.env.NEXT_PUBLIC_LOCALE;
  }
  return 'en';
}

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale?: string): Translations {
  const currentLocale = locale || getLocale();
  return translations[currentLocale] || translations.en;
}

/**
 * Get a translation value by key path (e.g., 'common.loading' or 'fields.jurisdiction')
 */
export function t(keyPath: string, locale?: string): string {
  const translations = getTranslations(locale);
  const keys = keyPath.split('.');
  let value: any = translations;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key as keyof typeof value];
    } else {
      // Fallback to English if key not found
      const enValue = getTranslations('en');
      let fallback: any = enValue;
      for (const fallbackKey of keys) {
        if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
          fallback = fallback[fallbackKey as keyof typeof fallback];
        } else {
          return keyPath; // Return key path if not found even in English
        }
      }
      return typeof fallback === 'string' ? fallback : keyPath;
    }
  }
  
  return typeof value === 'string' ? value : keyPath;
}

/**
 * Hook for client components to access translations
 */
export function useTranslation() {
  const locale = getLocale();
  const translations = getTranslations(locale);
  
  return {
    t: (keyPath: string) => t(keyPath, locale),
    locale,
    translations,
  };
}

