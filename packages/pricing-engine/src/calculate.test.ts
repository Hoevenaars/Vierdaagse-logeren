import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStayPrice } from './calculate.ts';
import type { PricingRule } from '../../database/src/index.ts';

function rule(overrides: Partial<PricingRule> = {}): PricingRule {
  return {
    id: 'rule-a',
    providerId: 'provider-a',
    accommodationTypeId: 'acc-caravan',
    seasonYear: 2027,
    pricingType: 'fixed_week',
    basePrice: 175,
    pricePerPerson: 110,
    pricePerNight: null,
    electricityPrice: 75,
    parkingPrice: 25,
    touristTax: null,
    mandatoryFees: [],
    deposit: 50,
    currency: 'EUR',
    minimumNights: 5,
    packageStartDate: '2027-07-18',
    packageEndDate: '2027-07-23',
    notes: null,
    sourceUrl: 'https://example.com/prices',
    verifiedAt: '2026-09-01T00:00:00.000Z',
    confidenceScore: 0.98,
    ...overrides,
  };
}

const caravanRequest = {
  partySize: 2,
  nights: 5,
  electricity: true,
  parking: true,
  seasonYear: 2027,
  accommodationType: 'caravan' as const,
};

describe('calculateStayPrice', () => {
  it('matches the spec example of €495 for a caravan week with electricity and parking', () => {
    const result = calculateStayPrice({
      rule: rule(),
      request: caravanRequest,
    });

    assert.equal(result.complete, true);
    assert.equal(result.total, 495);
    assert.equal(result.estimated, false);
    assert.deepEqual(
      result.breakdown.map((line) => [line.label, line.amount]),
      [
        ['Standplaats (week)', 175],
        ['2 personen', 220],
        ['Stroom', 75],
        ['Parkeren', 25],
      ]
    );
  });

  it('treats included electricity as zero and keeps the total complete', () => {
    const result = calculateStayPrice({
      rule: rule({ electricityPrice: null }),
      request: caravanRequest,
      electricityAmenity: { available: true, included: true, price: null },
      parkingAmenity: { available: true, included: false, price: 25 },
    });

    assert.equal(result.total, 420);
    assert.equal(result.complete, true);
    const electricity = result.breakdown.find((line) => line.code === 'electricity');
    assert.equal(electricity?.amount, 0);
  });

  it('does not invent a missing electricity price', () => {
    const result = calculateStayPrice({
      rule: rule({ electricityPrice: null }),
      request: caravanRequest,
      electricityAmenity: { available: true, included: false, price: null },
    });

    assert.equal(result.complete, false);
    assert.equal(result.total, null);
    assert.ok(result.warnings.includes('Stroomprijs is onbekend.'));
    assert.equal(result.breakdown.some((line) => line.code === 'electricity'), false);
  });

  it('returns no total when there is no pricing rule', () => {
    const result = calculateStayPrice({
      rule: null,
      request: caravanRequest,
    });

    assert.equal(result.total, null);
    assert.equal(result.complete, false);
    assert.equal(result.breakdown.length, 0);
  });

  it('calculates per-night pitches with tourist tax and mandatory fees', () => {
    const result = calculateStayPrice({
      rule: rule({
        pricingType: 'per_night',
        basePrice: null,
        pricePerNight: 40,
        pricePerPerson: 12,
        electricityPrice: 10,
        parkingPrice: 0,
        touristTax: 1.5,
        mandatoryFees: [{ label: 'Milieuheffing', amount: 8 }],
      }),
      request: { ...caravanRequest, electricity: false, parking: false },
    });

    assert.equal(result.complete, true);
    assert.equal(result.total, 40 * 5 + 12 * 2 * 5 + 1.5 * 2 * 5 + 8);
  });

  it('does not add optional extras that were not requested', () => {
    const result = calculateStayPrice({
      rule: rule(),
      request: { ...caravanRequest, electricity: false, parking: false },
    });

    assert.equal(result.total, 395);
    assert.equal(result.breakdown.some((line) => line.code === 'electricity'), false);
    assert.equal(result.breakdown.some((line) => line.code === 'parking'), false);
  });
});
