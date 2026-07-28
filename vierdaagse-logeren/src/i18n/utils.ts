import { ui, defaultLocale, type Locale } from './ui';

export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split('/');
  if (maybeLocale === 'en' || maybeLocale === 'de') return maybeLocale;
  return defaultLocale;
}

export function useTranslations(locale: Locale) {
  return function t(key: keyof (typeof ui)['nl']): string {
    return ui[locale][key] ?? ui[defaultLocale][key];
  };
}

// Bouwt het pad naar dezelfde pagina in een andere taal.
// Simplificatie: alle talen delen dezelfde slug-structuur (geen vertaalde URLs).
// Dit is een bewuste keuze voor onderhoudbaarheid — zie 24_DECISION_LOG.md indien
// je later toch vertaalde slugs wilt (bijv. /de/ueber-uns i.p.v. /de/over-ons).
export function getLocalizedPath(currentPath: string, targetLocale: Locale): string {
  const segments = currentPath.split('/').filter(Boolean);
  if (segments[0] === 'en' || segments[0] === 'de') segments.shift();
  const rest = segments.join('/');
  if (targetLocale === defaultLocale) return `/${rest}`;
  return `/${targetLocale}/${rest}`;
}

/**
 * Vervangt {{placeholders}} door echte paden en zet enkelvoudige markdown-links
 * ([tekst](url)) om naar HTML. Bedoeld voor korte, CMS-bewerkbare tekstvelden
 * (intro's, slotzinnen) — niet voor lange content, daarvoor: PageTemplate + marked.
 */
export function linkify(text: string, links: Record<string, string> = {}): string {
  let result = text;
  for (const [placeholder, url] of Object.entries(links)) {
    result = result.replaceAll(`{{${placeholder}}}`, url);
  }
  return result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
