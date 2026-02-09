import fa from './fa.json';
import en from './en.json';

const translations: Record<string, Record<string, string>> = { fa, en };

export const defaultLocale = 'fa';
export const locales = ['fa', 'en'] as const;
export type Locale = (typeof locales)[number];

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en') return 'en';
  return 'fa';
}

export function t(key: string, lang: Locale = defaultLocale): string {
  return translations[lang]?.[key] ?? translations[defaultLocale]?.[key] ?? key;
}

export function getDir(lang: Locale): 'rtl' | 'ltr' {
  return lang === 'fa' ? 'rtl' : 'ltr';
}

export function getLocalizedPath(path: string, lang: Locale): string {
  // Remove leading slash and any existing locale prefix
  const cleanPath = path.replace(/^\//, '').replace(/^(en|fa)\//, '');

  if (lang === defaultLocale) {
    return `/${cleanPath}`;
  }
  return `/${lang}/${cleanPath}`;
}

export function getAlternateLocale(lang: Locale): Locale {
  return lang === 'fa' ? 'en' : 'fa';
}

/** Strip the lang prefix (e.g. "fa/" or "en/") from a content collection ID */
export function stripLangPrefix(id: string): string {
  return id.replace(/^(fa|en)\//, '');
}
