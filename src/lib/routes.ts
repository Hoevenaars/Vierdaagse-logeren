import { getProviderCities, getPublishedProviders } from './providers.ts';
import { SEO_FILTERS, type SeoFilter } from './search.ts';

export type CampingPathKind =
  | { kind: 'provider'; slug: string }
  | { kind: 'city'; citySlug: string; cityName: string }
  | { kind: 'filter'; filter: SeoFilter };

export function campingStaticPaths(): Array<{ params: { path: string }; props: CampingPathKind }> {
  const providerPaths = getPublishedProviders().map((provider) => ({
    params: { path: provider.slug },
    props: { kind: 'provider' as const, slug: provider.slug },
  }));
  const cityPaths = getProviderCities().map((city) => ({
    params: { path: city.slug },
    props: { kind: 'city' as const, citySlug: city.slug, cityName: city.name },
  }));
  const filterPaths = SEO_FILTERS.map((filter) => ({
    params: { path: filter },
    props: { kind: 'filter' as const, filter },
  }));
  return [...providerPaths, ...cityPaths, ...filterPaths];
}

export function seoFilterCopy(filter: SeoFilter, locale: 'nl' | 'en' | 'de'): { title: string; intro: string } {
  const copy = {
    'met-stroom': {
      nl: { title: 'Vierdaagsecampings met stroom', intro: 'Campings waar stroom bevestigd beschikbaar is, inbegrepen of tegen meerprijs.' },
      en: { title: 'Four Days Marches campsites with electricity', intro: 'Campsites where electricity is confirmed, included or as an extra.' },
      de: { title: 'Vierdaagse-Campings mit Strom', intro: 'Campings, bei denen Strom bestätigt verfügbar ist, inklusive oder gegen Aufpreis.' },
    },
    'met-camper': {
      nl: { title: 'Vierdaagsecampings met camper', intro: 'Terreinen met een bevestigde camperplaats voor de Vierdaagseweek.' },
      en: { title: 'Four Days Marches campsites for campers', intro: 'Sites with a confirmed camper pitch for event week.' },
      de: { title: 'Vierdaagse-Campings mit Wohnmobil', intro: 'Plätze mit bestätigtem Wohnmobilstellplatz für die Eventwoche.' },
    },
    'met-massage': {
      nl: { title: 'Vierdaagsecampings met massage of blarenzorg', intro: 'Campings met massage, blarenzorg of fysiotherapie op of bij het terrein.' },
      en: { title: 'Campsites with massage or blister care', intro: 'Sites with massage, blister care or physiotherapy on or next to the grounds.' },
      de: { title: 'Campings mit Massage oder Blasenpflege', intro: 'Plätze mit Massage, Blasenpflege oder Physiotherapie am Gelände.' },
    },
    'dicht-bij-wedren': {
      nl: { title: 'Campings binnen 20 minuten fietsen van de Wedren', intro: 'Alleen terreinen waarvan de geschatte fietstijd naar de Wedren 20 minuten of minder is.' },
      en: { title: 'Campsites within 20 minutes cycling of the Wedren', intro: 'Only sites whose estimated cycling time to the Wedren is 20 minutes or less.' },
      de: { title: 'Campings innerhalb von 20 Minuten zur Wedren', intro: 'Nur Plätze mit geschätzter Fahrradzeit von 20 Minuten oder weniger zur Wedren.' },
    },
    goedkoop: {
      nl: { title: 'Goedkopere Vierdaagsecampings', intro: 'Campings in de lagere range van de berekende totale weekprijs voor een standaard tentscenario.' },
      en: { title: 'Lower-cost Four Days Marches campsites', intro: 'Campsites in the lower range of calculated total week cost for a standard tent scenario.' },
      de: { title: 'Günstigere Vierdaagse-Campings', intro: 'Campings im unteren Bereich der berechneten Gesamtwochenkosten für ein Standard-Zeltszenario.' },
    },
  } as const;
  return copy[filter][locale];
}
