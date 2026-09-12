import type { PreferenceId, TravelerStayType } from '../../database/src/index.ts';
import { STAY_TYPE_TO_ACCOMMODATION } from '../../database/src/index.ts';
import type { PriceResult } from '../../pricing-engine/src/index.ts';
import type {
  AccommodationTypeKey,
  AmenityId,
  AvailabilityStatus,
} from '../../database/src/index.ts';

export const RANKING_WEIGHTS = {
  preferenceMatch: 0.3,
  price: 0.2,
  distance: 0.15,
  amenity: 0.15,
  availability: 0.1,
  quality: 0.1,
} as const;

export interface RankableProvider {
  id: string;
  slug: string;
  distanceKm: number;
  cyclingMinutes: number;
  amenityIds: AmenityId[];
  availabilityStatus: AvailabilityStatus;
  verified: boolean;
  lastVerifiedAt: string | null;
  avgConfidence: number;
  price: PriceResult;
  supportedTypes: AccommodationTypeKey[];
  maxPeople: number;
  featured: boolean;
}

export interface RankingInput {
  stayType: TravelerStayType;
  partySize: number;
  preferences: PreferenceId[];
}

export interface RankedProvider {
  id: string;
  slug: string;
  score: number;
  matchPercent: number;
  reasons: string[];
  primary: boolean;
  sponsored: boolean;
}

const AVAILABILITY_SCORE: Record<AvailabilityStatus, number> = {
  available: 100,
  limited: 70,
  not_open_yet: 55,
  unknown: 30,
  sold_out: 0,
};

const CLOSE_TO_START_MINUTES = 20;
const MANY_AMENITIES_THRESHOLD = 8;

export function rankProviders(
  providers: RankableProvider[],
  input: RankingInput
): RankedProvider[] {
  const compatible = providers.filter((provider) => isCompatible(provider, input));
  const completePrices = compatible
    .map((provider) => provider.price.total)
    .filter((total): total is number => total != null)
    .sort((a, b) => a - b);

  const cheapestCutoff =
    completePrices.length === 0
      ? null
      : completePrices[Math.max(0, Math.ceil(completePrices.length * 0.35) - 1)];

  const distances = compatible.map((provider) => provider.distanceKm);
  const amenityCounts = compatible.map((provider) => provider.amenityIds.length);

  const scored = compatible.map((provider) => {
    const preferenceHits = input.preferences.filter((preference) =>
      preferenceSatisfied(preference, provider, cheapestCutoff)
    );
    const preferenceMatch =
      input.preferences.length === 0
        ? 70
        : (preferenceHits.length / input.preferences.length) * 100;

    const priceScore = scorePrice(provider.price.total, completePrices);
    const distanceScore = invertMinMax(provider.distanceKm, distances);
    const amenityScore = minMax(provider.amenityIds.length, amenityCounts);
    const availabilityScore = AVAILABILITY_SCORE[provider.availabilityStatus];
    const qualityScore = scoreQuality(provider);

    const score =
      preferenceMatch * RANKING_WEIGHTS.preferenceMatch +
      priceScore * RANKING_WEIGHTS.price +
      distanceScore * RANKING_WEIGHTS.distance +
      amenityScore * RANKING_WEIGHTS.amenity +
      availabilityScore * RANKING_WEIGHTS.availability +
      qualityScore * RANKING_WEIGHTS.quality;

    const reasons = preferenceHits.map((preference) => preference);

    return {
      id: provider.id,
      slug: provider.slug,
      score: Math.round(score * 10) / 10,
      matchPercent: Math.round(score),
      reasons,
      primary: false,
      sponsored: false,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  scored.forEach((item, index) => {
    item.primary = index < 3;
  });

  return scored;
}

export function isCompatible(provider: RankableProvider, input: RankingInput): boolean {
  const wanted = STAY_TYPE_TO_ACCOMMODATION[input.stayType];
  const typeOk = provider.supportedTypes.some((type) => wanted.includes(type));
  return typeOk && provider.maxPeople >= input.partySize;
}

function preferenceSatisfied(
  preference: PreferenceId,
  provider: RankableProvider,
  cheapestCutoff: number | null
): boolean {
  switch (preference) {
    case 'close_to_start':
      return provider.cyclingMinutes <= CLOSE_TO_START_MINUTES;
    case 'quiet':
      return provider.amenityIds.includes('quiet_area');
    case 'social':
      return provider.amenityIds.includes('social_area');
    case 'lowest_price':
      return provider.price.total != null && cheapestCutoff != null && provider.price.total <= cheapestCutoff;
    case 'many_amenities':
      return provider.amenityIds.length >= MANY_AMENITIES_THRESHOLD;
    case 'early_breakfast':
      return provider.amenityIds.includes('early_breakfast');
    case 'blister_care':
      return (
        provider.amenityIds.includes('blister_care') ||
        provider.amenityIds.includes('massage') ||
        provider.amenityIds.includes('physiotherapy')
      );
    case 'bike_rental':
      return provider.amenityIds.includes('bike_rental');
    case 'parking':
      return provider.amenityIds.includes('parking');
    case 'electricity':
      return provider.amenityIds.includes('electricity');
    default:
      return false;
  }
}

function scorePrice(total: number | null, completePrices: number[]): number {
  if (total == null || completePrices.length === 0) return 40;
  return invertMinMax(total, completePrices);
}

function scoreQuality(provider: RankableProvider): number {
  const verifiedScore = provider.verified ? 50 : 15;
  const recencyScore = recencyPoints(provider.lastVerifiedAt);
  const confidenceScore = Math.max(0, Math.min(100, provider.avgConfidence * 100)) * 0.2;
  return Math.min(100, verifiedScore + recencyScore + confidenceScore);
}

function recencyPoints(lastVerifiedAt: string | null): number {
  if (!lastVerifiedAt) return 0;
  const verified = Date.parse(lastVerifiedAt);
  if (Number.isNaN(verified)) return 0;
  const ageDays = (Date.now() - verified) / (1000 * 60 * 60 * 24);
  if (ageDays <= 7) return 30;
  if (ageDays <= 30) return 20;
  if (ageDays <= 90) return 10;
  return 0;
}

function minMax(value: number, values: number[]): number {
  if (values.length === 0) return 50;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 70;
  return ((value - min) / (max - min)) * 100;
}

function invertMinMax(value: number, values: number[]): number {
  if (values.length === 0) return 50;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 70;
  return ((max - value) / (max - min)) * 100;
}
