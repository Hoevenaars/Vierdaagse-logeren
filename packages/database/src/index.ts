export * from './types.ts';
export * from './amenities.ts';

export const WEDREN = {
  name: 'Wedren',
  city: 'Nijmegen',
  latitude: 51.8428,
  longitude: 5.8639,
} as const;

export const DEFAULT_SEASON_YEAR = 2027;
export const DEFAULT_NIGHTS = 5;
export const DEFAULT_PARTY_SIZE = 2;
export const CYCLING_KM_PER_HOUR = 16;

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

export function cyclingMinutesFromKm(distanceKm: number): number {
  return Math.round((distanceKm / CYCLING_KM_PER_HOUR) * 60);
}
