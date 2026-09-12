import type {
  AccommodationTypeKey,
  PricingRule,
  ProviderAmenity,
} from '../../database/src/index.ts';

export interface PriceLine {
  code:
    | 'pitch'
    | 'persons'
    | 'nights'
    | 'package'
    | 'electricity'
    | 'parking'
    | 'tourist_tax'
    | 'mandatory';
  label: string;
  amount: number;
  optional: boolean;
}

export interface PriceRequest {
  partySize: number;
  nights: number;
  electricity: boolean;
  parking: boolean;
  seasonYear: number;
  accommodationType: AccommodationTypeKey;
}

export interface PriceResult {
  total: number | null;
  currency: 'EUR';
  complete: boolean;
  breakdown: PriceLine[];
  warnings: string[];
  estimated: false;
  deposit: number | null;
}

export interface PriceCalculationInput {
  rule: PricingRule | null;
  request: PriceRequest;
  electricityAmenity?: Pick<ProviderAmenity, 'available' | 'included' | 'price'> | null;
  parkingAmenity?: Pick<ProviderAmenity, 'available' | 'included' | 'price'> | null;
}
