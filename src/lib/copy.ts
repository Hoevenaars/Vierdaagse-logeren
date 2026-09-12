import type { Locale } from '../i18n/ui.ts';
import type { AvailabilityStatus, PreferenceId, TravelerStayType, TransportMode } from '../../packages/database/src/index.ts';

interface Localized {
  nl: string;
  en: string;
  de: string;
}

function pick(locale: Locale, value: Localized): string {
  return value[locale];
}

export const productCopy = {
  tagline: { nl: 'Goed slapen. Beter lopen.', en: 'Sleep well. Walk better.', de: 'Gut schlafen. Besser laufen.' },
  heroTitle: {
    nl: 'Vind de Vierdaagsecamping die bij jou past',
    en: 'Find the Four Days Marches campsite that fits you',
    de: 'Finde den Vierdaagse-Campingplatz, der zu dir passt',
  },
  heroIntro: {
    nl: 'Vergelijk totale prijs, afstand tot de Wedren, vervoer en voorzieningen. Binnen twee minuten een shortlist.',
    en: 'Compare total price, distance to the Wedren, transport and facilities. A shortlist in about two minutes.',
    de: 'Vergleiche Gesamtpreis, Distanz zur Wedren, Anreise und Ausstattung. In zwei Minuten eine Shortlist.',
  },
  matchCta: { nl: 'Toon campings', en: 'Show campsites', de: 'Campings zeigen' },
  step1: { nl: 'Waarmee kom je?', en: 'How are you arriving?', de: 'Womit kommst du?' },
  step2: { nl: 'Met hoeveel personen?', en: 'How many people?', de: 'Mit wie vielen Personen?' },
  step3: { nl: 'Wat is belangrijk?', en: 'What matters most?', de: 'Was ist wichtig?' },
  stay: {
    tent: { nl: 'Tent', en: 'Tent', de: 'Zelt' },
    caravan: { nl: 'Caravan', en: 'Caravan', de: 'Wohnwagen' },
    camper: { nl: 'Camper', en: 'Camper', de: 'Wohnmobil' },
    furnished: { nl: 'Ingerichte tent', en: 'Ready-pitched tent', de: 'Fertiges Zelt' },
  } satisfies Record<TravelerStayType, Localized>,
  party: {
    '1': { nl: '1 persoon', en: '1 person', de: '1 Person' },
    '2': { nl: '2 personen', en: '2 people', de: '2 Personen' },
    '3-4': { nl: '3 tot 4 personen', en: '3 to 4 people', de: '3 bis 4 Personen' },
    '5plus': { nl: '5+ personen', en: '5+ people', de: '5+ Personen' },
  },
  preference: {
    close_to_start: { nl: 'Dicht bij de start', en: 'Close to the start', de: 'Nah am Start' },
    quiet: { nl: 'Rustig slapen', en: 'Quiet night', de: 'Ruhig schlafen' },
    social: { nl: 'Gezelligheid', en: 'Social atmosphere', de: 'Geselligkeit' },
    lowest_price: { nl: 'Laagste totale prijs', en: 'Lowest total price', de: 'Niedrigster Gesamtpreis' },
    many_amenities: { nl: 'Veel voorzieningen', en: 'Many facilities', de: 'Viele Einrichtungen' },
    early_breakfast: { nl: 'Vroeg ontbijt', en: 'Early breakfast', de: 'Frühes Frühstück' },
    blister_care: { nl: 'Massage / blarenzorg', en: 'Massage / blister care', de: 'Massage / Blasenpflege' },
    bike_rental: { nl: 'Fietsverhuur', en: 'Bike rental', de: 'Fahrradverleih' },
    parking: { nl: 'Parkeren', en: 'Parking', de: 'Parken' },
    electricity: { nl: 'Stroom', en: 'Electricity', de: 'Strom' },
  } satisfies Record<PreferenceId, Localized>,
  availability: {
    available: { nl: 'Beschikbaar', en: 'Available', de: 'Verfügbar' },
    limited: { nl: 'Beperkt beschikbaar', en: 'Limited availability', de: 'Begrenzt verfügbar' },
    sold_out: { nl: 'Vol', en: 'Sold out', de: 'Ausgebucht' },
    not_open_yet: { nl: 'Boekingen 2027 nog niet open', en: '2027 booking not open yet', de: 'Buchung 2027 noch nicht offen' },
    unknown: { nl: 'Status onbekend', en: 'Status unknown', de: 'Status unbekannt' },
  } satisfies Record<AvailabilityStatus, Localized>,
  transport: {
    bike: { nl: 'Fiets', en: 'Bike', de: 'Fahrrad' },
    shuttle: { nl: 'Shuttle', en: 'Shuttle', de: 'Shuttle' },
    train: { nl: 'Trein', en: 'Train', de: 'Zug' },
    car: { nl: 'Auto', en: 'Car', de: 'Auto' },
  } satisfies Record<TransportMode, Localized>,
  matchScore: { nl: 'matchscore', en: 'match score', de: 'Matchscore' },
  totalLabel: { nl: 'Totale verblijfskosten', en: 'Total stay cost', de: 'Gesamtkosten' },
  incompletePrice: {
    nl: 'Totaal niet betrouwbaar te berekenen',
    en: 'Total cannot be calculated reliably',
    de: 'Gesamtpreis nicht zuverlässig berechenbar',
  },
  compare: { nl: 'Vergelijk', en: 'Compare', de: 'Vergleichen' },
  compareNow: { nl: 'Vergelijk selectie', en: 'Compare selection', de: 'Auswahl vergleichen' },
  details: { nl: 'Bekijk camping', en: 'View campsite', de: 'Camping ansehen' },
  book: { nl: 'Naar aanbieder', en: 'Go to provider', de: 'Zum Anbieter' },
  primaryMatches: { nl: 'Beste matches', en: 'Best matches', de: 'Beste Treffer' },
  otherMatches: { nl: 'Overige relevante campings', en: 'Other relevant campsites', de: 'Weitere passende Campings' },
  alertTitle: { nl: 'Laat mij weten zodra Vierdaagsecampings voor 2027 openen', en: 'Tell me when 2027 Four Days Marches campsites open', de: 'Sag Bescheid, sobald Vierdaagse-Campings für 2027 öffnen' },
  alertIntro: {
    nl: 'Geen nieuwsbrief. Alleen een seintje wanneer boekingen openen of een plek schaars wordt.',
    en: 'Not a newsletter. Just an alert when bookings open or a pitch becomes scarce.',
    de: 'Kein Newsletter. Nur ein Hinweis, wenn Buchungen öffnen oder Plätze knapp werden.',
  },
  lastVerified: { nl: 'Laatst gecontroleerd', en: 'Last verified', de: 'Zuletzt geprüft' },
  sponsored: { nl: 'Uitgelicht (gesponsord)', en: 'Featured (sponsored)', de: 'Hervorgehoben (gesponsert)' },
  filtersTitle: { nl: 'Filters', en: 'Filters', de: 'Filter' },
  allCampings: { nl: 'Alle Vierdaagsecampings', en: 'All Four Days Marches campsites', de: 'Alle Vierdaagse-Campingplätze' },
  mapTitle: { nl: 'Ligging ten opzichte van de Wedren', en: 'Location relative to the Wedren', de: 'Lage relativ zur Wedren' },
  breakdownTitle: { nl: 'Opbouw van de prijs', en: 'Price breakdown', de: 'Preisaufstellung' },
  optional: { nl: 'optioneel', en: 'optional', de: 'optional' },
  mandatory: { nl: 'verplicht', en: 'mandatory', de: 'pflicht' },
  leadTitle: { nl: 'Vraag stellen of seintje krijgen', en: 'Ask a question or get an alert', de: 'Frage stellen oder Hinweis erhalten' },
  scenario: {
    nl: 'Scenario: 5 nachten, Vierdaagseweek 2027',
    en: 'Scenario: 5 nights, 2027 event week',
    de: 'Szenario: 5 Nächte, Vierdaagse-Woche 2027',
  },
} as const;

export function tProduct<K extends keyof typeof productCopy>(locale: Locale, key: K): (typeof productCopy)[K] extends Localized ? string : (typeof productCopy)[K] {
  const value = productCopy[key];
  if (isLocalized(value)) return pick(locale, value) as never;
  return value as never;
}

export function stayLabel(locale: Locale, stay: TravelerStayType): string {
  return pick(locale, productCopy.stay[stay]);
}

export function preferenceLabel(locale: Locale, preference: PreferenceId): string {
  return pick(locale, productCopy.preference[preference]);
}

export function availabilityLabel(locale: Locale, status: AvailabilityStatus): string {
  return pick(locale, productCopy.availability[status]);
}

export function transportLabel(locale: Locale, mode: TransportMode): string {
  return pick(locale, productCopy.transport[mode]);
}

function isLocalized(value: unknown): value is Localized {
  return Boolean(value && typeof value === 'object' && 'nl' in value && 'en' in value && 'de' in value);
}
