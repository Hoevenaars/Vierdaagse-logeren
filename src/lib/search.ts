import {
  DEFAULT_NIGHTS,
  DEFAULT_PARTY_SIZE,
  DEFAULT_SEASON_YEAR,
  STAY_TYPE_TO_ACCOMMODATION,
  type AccommodationType,
  type AmenityId,
  type PreferenceId,
  type Provider,
  type TravelerStayType,
} from '../../packages/database/src/index.ts';
import { calculateStayPrice, type PriceRequest, type PriceResult } from '../../packages/pricing-engine/src/index.ts';
import { rankProviders, type RankableProvider, type RankedProvider } from '../../packages/ranking-engine/src/index.ts';
import { averageConfidence } from './providers.ts';

export interface SearchQuery {
  stayType: TravelerStayType;
  partySize: number;
  preferences: PreferenceId[];
  nights: number;
  seasonYear: number;
  electricity: boolean;
  parking: boolean;
}

export interface SearchMatch {
  provider: Provider;
  ranked: RankedProvider;
  price: PriceResult;
  accommodation: AccommodationType | null;
}

const PARTY_SIZE_VALUES = {
  '1': 1,
  '2': 2,
  '3-4': 3,
  '5plus': 5,
} as const;

export function parseSearchParams(params: URLSearchParams): SearchQuery | null {
  const stayType = params.get('type');
  if (stayType !== 'tent' && stayType !== 'caravan' && stayType !== 'camper' && stayType !== 'furnished') {
    return null;
  }

  const partyKey = params.get('party') ?? '2';
  const partySize = partyKey in PARTY_SIZE_VALUES ? PARTY_SIZE_VALUES[partyKey as keyof typeof PARTY_SIZE_VALUES] : Number(partyKey);
  const safeParty = Number.isFinite(partySize) && partySize > 0 ? Math.min(partySize, 12) : DEFAULT_PARTY_SIZE;

  const preferences = (params.getAll('prefs').length ? params.getAll('prefs') : (params.get('prefs') ?? '').split(','))
    .map((value) => value.trim())
    .filter((value): value is PreferenceId => isPreference(value));

  const nights = Number(params.get('nights') ?? DEFAULT_NIGHTS);
  const electricity = params.has('electricity')
    ? params.get('electricity') === '1'
    : preferences.includes('electricity') || stayType === 'caravan' || stayType === 'camper';
  const parking = params.has('parking')
    ? params.get('parking') === '1'
    : preferences.includes('parking') || stayType === 'caravan' || stayType === 'camper';

  return {
    stayType,
    partySize: safeParty,
    preferences,
    nights: Number.isFinite(nights) && nights > 0 ? Math.min(nights, 14) : DEFAULT_NIGHTS,
    seasonYear: DEFAULT_SEASON_YEAR,
    electricity,
    parking,
  };
}

export function defaultSearchQuery(): SearchQuery {
  return {
    stayType: 'tent',
    partySize: DEFAULT_PARTY_SIZE,
    preferences: [],
    nights: DEFAULT_NIGHTS,
    seasonYear: DEFAULT_SEASON_YEAR,
    electricity: false,
    parking: false,
  };
}

export function resolveAccommodation(provider: Provider, stayType: TravelerStayType): AccommodationType | null {
  const wanted = STAY_TYPE_TO_ACCOMMODATION[stayType];
  return provider.accommodationTypes.find((item) => wanted.includes(item.type) && item.available) ?? null;
}

export function priceForProvider(provider: Provider, query: SearchQuery): { price: PriceResult; accommodation: AccommodationType | null } {
  const accommodation = resolveAccommodation(provider, query.stayType);
  const rule = accommodation
    ? provider.pricingRules.find(
        (item) => item.accommodationTypeId === accommodation.id && item.seasonYear === query.seasonYear
      ) ?? null
    : null;

  const request: PriceRequest = {
    accommodationType: accommodation?.type ?? 'small_tent',
    partySize: query.partySize,
    nights: query.nights,
    electricity: query.electricity,
    parking: query.parking,
    seasonYear: query.seasonYear,
  };

  return {
    accommodation,
    price: calculateStayPrice({
      rule,
      request,
      electricityAmenity: provider.amenities.find((item) => item.amenityId === 'electricity'),
      parkingAmenity: provider.amenities.find((item) => item.amenityId === 'parking'),
    }),
  };
}

export function searchProviders(providers: Provider[], query: SearchQuery): SearchMatch[] {
  const rankable: RankableProvider[] = providers.map((provider) => {
    const { price } = priceForProvider(provider, query);
    const supported = provider.accommodationTypes.filter((item) => item.available);
    return {
      id: provider.id,
      slug: provider.slug,
      distanceKm: provider.distanceToWedrenKm,
      cyclingMinutes: provider.cyclingMinutesToWedren,
      amenityIds: provider.amenities.filter((item) => item.available).map((item) => item.amenityId),
      availabilityStatus: provider.availability[0]?.status ?? 'unknown',
      verified: provider.verified,
      lastVerifiedAt: provider.lastVerifiedAt,
      avgConfidence: averageConfidence(provider),
      price,
      supportedTypes: supported.map((item) => item.type),
      maxPeople: Math.max(0, ...supported.map((item) => item.maxPeople)),
      featured: provider.featured,
    };
  });

  const ranked = rankProviders(rankable, {
    stayType: query.stayType,
    partySize: query.partySize,
    preferences: query.preferences,
  });

  return ranked.flatMap((item) => {
    const provider = providers.find((entry) => entry.id === item.id);
    if (!provider) return [];
    const priced = priceForProvider(provider, query);
    return [
      {
        provider,
        ranked: item,
        price: priced.price,
        accommodation: priced.accommodation,
      },
    ];
  });
}

export const SEO_FILTERS = [
  'met-stroom',
  'met-camper',
  'met-massage',
  'dicht-bij-wedren',
  'goedkoop',
] as const;

export type SeoFilter = (typeof SEO_FILTERS)[number];

export function isSeoFilter(value: string): value is SeoFilter {
  return (SEO_FILTERS as readonly string[]).includes(value);
}

export function providersForSeoFilter(providers: Provider[], filter: SeoFilter): Provider[] {
  const query = defaultSearchQuery();
  switch (filter) {
    case 'met-stroom':
      return providers.filter((provider) => hasAmenity(provider, 'electricity'));
    case 'met-camper':
      return providers.filter((provider) => provider.accommodationTypes.some((item) => item.type === 'camper' && item.available));
    case 'met-massage':
      return providers.filter(
        (provider) => hasAmenity(provider, 'massage') || hasAmenity(provider, 'blister_care') || hasAmenity(provider, 'physiotherapy')
      );
    case 'dicht-bij-wedren':
      return providers.filter((provider) => provider.cyclingMinutesToWedren <= 20);
    case 'goedkoop': {
      const priced = providers
        .map((provider) => ({ provider, total: priceForProvider(provider, query).price.total }))
        .filter((item) => item.total != null)
        .sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
      const cutoff = priced[Math.max(0, Math.ceil(priced.length * 0.4) - 1)]?.total ?? null;
      return priced.filter((item) => cutoff != null && item.total != null && item.total <= cutoff).map((item) => item.provider);
    }
    default:
      return providers;
  }
}

export function hasAmenity(provider: Provider, amenityId: AmenityId): boolean {
  return provider.amenities.some((item) => item.amenityId === amenityId && item.available);
}

function isPreference(value: string): value is PreferenceId {
  return [
    'close_to_start',
    'quiet',
    'social',
    'lowest_price',
    'many_amenities',
    'early_breakfast',
    'blister_care',
    'bike_rental',
    'parking',
    'electricity',
  ].includes(value);
}
