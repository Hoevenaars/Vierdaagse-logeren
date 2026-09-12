import type { Locale } from '../i18n/ui.ts';

export function formatEuro(amount: number | null, locale: Locale): string {
  if (amount == null) return locale === 'de' ? 'Preis unbekannt' : locale === 'en' ? 'Price unknown' : 'Prijs onbekend';
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKm(km: number, locale: Locale): string {
  const value = km.toLocaleString(locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'nl-NL', {
    maximumFractionDigits: 1,
  });
  return `${value} km`;
}

export function formatMinutes(minutes: number, locale: Locale): string {
  if (locale === 'de') return `${minutes} Min. fietsen`;
  if (locale === 'en') return `${minutes} min cycling`;
  return `${minutes} min. fietsen`;
}
