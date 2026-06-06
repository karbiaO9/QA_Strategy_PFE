import { Locale, DEFAULT_LOCALE } from './types';

// Translation table per template — keeps each email's strings local
// instead of growing a giant global i18n file.
export type LocaleDict<T extends Record<string, string>> = {
  [L in Locale]: T;
};

// Falls back to the default locale if the requested one isn't registered.
export function resolveDict<T extends Record<string, string>>(
  dicts: LocaleDict<T>,
  locale: Locale | undefined,
): T {
  return dicts[locale ?? DEFAULT_LOCALE] ?? dicts[DEFAULT_LOCALE];
}

// Replaces `{{key}}` in `template` with the matching value from `vars`.
// Missing keys are left untouched so they're easy to spot in the output.
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`,
  );
}
