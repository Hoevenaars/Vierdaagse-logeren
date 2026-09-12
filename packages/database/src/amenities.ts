import type { AmenityId } from './types.ts';

export interface AmenityDefinition {
  id: AmenityId;
  labelNl: string;
  labelEn: string;
  labelDe: string;
}

export const AMENITY_CATALOG: AmenityDefinition[] = [
  { id: 'electricity', labelNl: 'Stroom', labelEn: 'Electricity', labelDe: 'Strom' },
  { id: 'parking', labelNl: 'Parkeren', labelEn: 'Parking', labelDe: 'Parken' },
  { id: 'early_breakfast', labelNl: 'Vroeg ontbijt', labelEn: 'Early breakfast', labelDe: 'Frühes Frühstück' },
  { id: 'dinner', labelNl: 'Avondeten', labelEn: 'Dinner', labelDe: 'Abendessen' },
  { id: 'bike_rental', labelNl: 'Fietsverhuur', labelEn: 'Bike rental', labelDe: 'Fahrradverleih' },
  { id: 'bike_storage', labelNl: 'Fietsenstalling', labelEn: 'Bike storage', labelDe: 'Fahrradabstellplatz' },
  { id: 'shuttle', labelNl: 'Shuttle', labelEn: 'Shuttle', labelDe: 'Shuttle' },
  { id: 'massage', labelNl: 'Massage', labelEn: 'Massage', labelDe: 'Massage' },
  { id: 'blister_care', labelNl: 'Blarenzorg', labelEn: 'Blister care', labelDe: 'Blasenpflege' },
  { id: 'physiotherapy', labelNl: 'Fysiotherapie', labelEn: 'Physiotherapy', labelDe: 'Physiotherapie' },
  { id: 'showers', labelNl: 'Douches', labelEn: 'Showers', labelDe: 'Duschen' },
  { id: 'toilets', labelNl: 'Toiletten', labelEn: 'Toilets', labelDe: 'Toiletten' },
  { id: 'wifi', labelNl: 'Wifi', labelEn: 'Wifi', labelDe: 'WLAN' },
  { id: 'charging_points', labelNl: 'Oplaadpunten', labelEn: 'Charging points', labelDe: 'Ladepunkte' },
  { id: 'quiet_area', labelNl: 'Rustige zone', labelEn: 'Quiet area', labelDe: 'Ruhebereich' },
  { id: 'social_area', labelNl: 'Gezelligheid', labelEn: 'Social area', labelDe: 'Geselligkeit' },
  { id: 'food_service', labelNl: 'Eten op het terrein', labelEn: 'Food service', labelDe: 'Verpflegung' },
  { id: 'luggage_storage', labelNl: 'Bagageopslag', labelEn: 'Luggage storage', labelDe: 'Gepäckaufbewahrung' },
];

export function amenityLabel(id: AmenityId, locale: 'nl' | 'en' | 'de' = 'nl'): string {
  const item = AMENITY_CATALOG.find((entry) => entry.id === id);
  if (!item) return id;
  if (locale === 'en') return item.labelEn;
  if (locale === 'de') return item.labelDe;
  return item.labelNl;
}

export const STAY_TYPE_TO_ACCOMMODATION: Record<
  import('./types.ts').TravelerStayType,
  import('./types.ts').AccommodationTypeKey[]
> = {
  tent: ['small_tent', 'large_tent'],
  caravan: ['caravan', 'folding_trailer'],
  camper: ['camper'],
  furnished: ['furnished_tent', 'room'],
};
