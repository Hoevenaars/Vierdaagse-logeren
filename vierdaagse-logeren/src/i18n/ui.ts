import siteStringsData from '../data/site-strings.json';

export const languages = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
} as const;

export type Locale = keyof typeof languages;

export const defaultLocale: Locale = 'nl';

interface SiteString {
  key: string;
  nl: string;
  de: string;
  en: string;
  vertaalstatus?: { de?: string; en?: string };
}

const siteStrings = siteStringsData.strings as SiteString[];

// site-strings.json is de CMS-bewerkbare bron: één rij per string, nl/de/en
// naast elkaar (Decap list-widget). Hier omgezet naar de vorm die de rest van
// de site al gebruikt: ui[locale][key]. Ontbreekt een de/en-vertaling nog
// (leeg veld, nog niet gecontroleerd door de vertaal-Action), dan valt
// useTranslations() terug op NL — nooit een lege string live tonen.
function buildUi() {
  const result: Record<Locale, Record<string, string>> = { nl: {}, en: {}, de: {} };
  for (const item of siteStrings) {
    result.nl[item.key] = item.nl;
    result.en[item.key] = item.en?.trim() ? item.en : item.nl;
    result.de[item.key] = item.de?.trim() ? item.de : item.nl;
  }
  return result;
}

export const ui = buildUi();
