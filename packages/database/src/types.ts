export const PROVIDER_STATUSES = ['active', 'inactive', 'unknown', 'sold_out'] as const;
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

export const PROVIDER_TYPES = ['camping', 'temporary_camping', 'glamping', 'accommodation'] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const ACCOMMODATION_TYPES = [
  'small_tent',
  'large_tent',
  'caravan',
  'folding_trailer',
  'camper',
  'furnished_tent',
  'room',
] as const;
export type AccommodationTypeKey = (typeof ACCOMMODATION_TYPES)[number];

export const TRAVELER_STAY_TYPES = ['tent', 'caravan', 'camper', 'furnished'] as const;
export type TravelerStayType = (typeof TRAVELER_STAY_TYPES)[number];

export const PRICING_TYPES = ['fixed_week', 'per_night', 'per_person', 'per_pitch', 'package'] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const AVAILABILITY_STATUSES = [
  'available',
  'limited',
  'sold_out',
  'not_open_yet',
  'unknown',
] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const AMENITY_IDS = [
  'electricity',
  'parking',
  'early_breakfast',
  'dinner',
  'bike_rental',
  'bike_storage',
  'shuttle',
  'massage',
  'blister_care',
  'physiotherapy',
  'showers',
  'toilets',
  'wifi',
  'charging_points',
  'quiet_area',
  'social_area',
  'food_service',
  'luggage_storage',
] as const;
export type AmenityId = (typeof AMENITY_IDS)[number];

export const PREFERENCE_IDS = [
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
] as const;
export type PreferenceId = (typeof PREFERENCE_IDS)[number];

export const TRANSPORT_MODES = ['bike', 'shuttle', 'train', 'car'] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const COMMERCIAL_PLANS = ['free', 'verified', 'featured', 'performance'] as const;
export type CommercialPlan = (typeof COMMERCIAL_PLANS)[number];

export const CHANGE_ACTION_TYPES = ['auto_applied', 'pending_review', 'rejected'] as const;
export type ChangeActionType = (typeof CHANGE_ACTION_TYPES)[number];

export const REVIEW_STATUSES = ['open', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface MandatoryFee {
  label: string;
  amount: number;
}

export interface AccommodationType {
  id: string;
  providerId: string;
  type: AccommodationTypeKey;
  maxPeople: number;
  electricityPossible: boolean;
  available: boolean;
  notes: string | null;
}

export interface PricingRule {
  id: string;
  providerId: string;
  accommodationTypeId: string;
  seasonYear: number;
  pricingType: PricingType;
  basePrice: number | null;
  pricePerPerson: number | null;
  pricePerNight: number | null;
  electricityPrice: number | null;
  parkingPrice: number | null;
  touristTax: number | null;
  mandatoryFees: MandatoryFee[];
  deposit: number | null;
  currency: 'EUR';
  minimumNights: number | null;
  packageStartDate: string | null;
  packageEndDate: string | null;
  notes: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  confidenceScore: number | null;
}

export interface ProviderAmenity {
  amenityId: AmenityId;
  available: boolean;
  included: boolean;
  price: number | null;
  notes: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  confidenceScore: number | null;
}

export interface Availability {
  id: string;
  providerId: string;
  accommodationTypeId: string | null;
  seasonYear: number;
  status: AvailabilityStatus;
  availableUnits: number | null;
  checkedAt: string;
  sourceUrl: string | null;
  confidenceScore: number | null;
}

export interface ProviderContent {
  intro: string;
  summary: string;
  whyInteresting: string;
  caveats: string[];
  metaTitle: string;
  metaDescription: string;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  websiteUrl: string | null;
  bookingUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  city: string;
  citySlug: string;
  postcode: string | null;
  latitude: number;
  longitude: number;
  distanceToWedrenKm: number;
  cyclingMinutesToWedren: number;
  status: ProviderStatus;
  providerType: ProviderType;
  verified: boolean;
  featured: boolean;
  commercialPlan: CommercialPlan;
  transportModes: TransportMode[];
  firstSeenAt: string;
  lastVerifiedAt: string | null;
  nextVerificationAt: string | null;
  createdAt: string;
  updatedAt: string;
  accommodationTypes: AccommodationType[];
  pricingRules: PricingRule[];
  amenities: ProviderAmenity[];
  availability: Availability[];
  content: ProviderContent;
}
