import { describe, expect, it } from 'vitest';
import { EN } from './en';
import { resolveLocale, setLanguageSetting, t } from './i18n';
import { RU } from './ru';
import { upgradeName } from './content';

describe('resolveLocale', () => {
  it('maps auto + ru browser to ru', () => {
    expect(resolveLocale('auto', 'ru-RU')).toBe('ru');
    expect(resolveLocale('auto', 'ru')).toBe('ru');
  });

  it('maps auto + en browser to en', () => {
    expect(resolveLocale('auto', 'en-US')).toBe('en');
  });

  it('honors explicit setting over browser', () => {
    expect(resolveLocale('ru', 'en-US')).toBe('ru');
    expect(resolveLocale('en', 'ru-RU')).toBe('en');
  });
});

describe('t', () => {
  it('falls back to English for missing Russian keys', () => {
    setLanguageSetting('ru', 'ru');
    expect(t('ui.brand')).toBe('NOT GENSHIN');
  });

  it('interpolates params', () => {
    setLanguageSetting('en', 'en');
    expect(t('ui.towerHp', { hp: 80, max: 100 })).toBe('Tower 80 / 100');
    setLanguageSetting('ru', 'ru');
    expect(t('ui.towerHp', { hp: 80, max: 100 })).toBe('Башня 80 / 100');
  });

  it('localizes upgrade names', () => {
    setLanguageSetting('ru', 'ru');
    expect(upgradeName('multishot_i')).toBe('Мультишот I');
    setLanguageSetting('en', 'en');
    expect(upgradeName('multishot_i')).toBe('Multishot I');
  });
});

describe('catalog coverage', () => {
  it('has a Russian entry for every English key', () => {
    const missing = Object.keys(EN).filter((key) => !(key in RU));
    expect(missing).toEqual([]);
  });
});
