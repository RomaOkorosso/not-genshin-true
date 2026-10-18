import { EN } from './en';
import { RU } from './ru';
import type { LanguageSetting, LocaleCatalog, LocaleCode, LocaleParams } from './types';

const CATALOGS: Record<LocaleCode, LocaleCatalog> = { en: EN, ru: RU };

let activeLocale: LocaleCode = 'en';
let languageSetting: LanguageSetting = 'auto';

export function resolveLocale(setting: LanguageSetting, browserLang: string): LocaleCode {
  if (setting === 'en' || setting === 'ru') return setting;
  const lang = (browserLang || 'en').toLowerCase();
  return lang === 'ru' || lang.startsWith('ru-') || lang.startsWith('ru_') ? 'ru' : 'en';
}

export function getLanguageSetting(): LanguageSetting {
  return languageSetting;
}

export function getLocale(): LocaleCode {
  return activeLocale;
}

export function setLanguageSetting(setting: LanguageSetting, browserLang: string): LocaleCode {
  languageSetting = setting;
  activeLocale = resolveLocale(setting, browserLang);
  return activeLocale;
}

export function setLocale(code: LocaleCode): void {
  activeLocale = code;
  languageSetting = code;
}

function interpolate(template: string, params?: LocaleParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

/** Translate a key; falls back to English, then to the key itself. */
export function t(key: string, params?: LocaleParams): string {
  const primary = CATALOGS[activeLocale][key];
  const fallback = EN[key];
  const raw = primary ?? fallback ?? key;
  return interpolate(raw, params);
}

export function hasKey(key: string): boolean {
  return key in EN || key in CATALOGS[activeLocale];
}
