import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rankProviders } from './rank.ts';
import type { RankableProvider } from './rank.ts';
import type { PriceResult } from '../../pricing-engine/src/index.ts';

function price(total: number | null, complete = total != null): PriceResult {
  return {
    total,
    currency: 'EUR',
    complete,
    breakdown: total == null ? [] : [{ code: 'pitch', label: 'Standplaats', amount: total, optional: false }],
    warnings: complete ? [] : ['incomplete'],
    estimated: false,
    deposit: null,
  };
}

function provider(overrides: Partial<RankableProvider>): RankableProvider {
  return {
    id: 'a',
    slug: 'a',
    distanceKm: 10,
    cyclingMinutes: 30,
    amenityIds: ['showers', 'toilets'],
    availabilityStatus: 'not_open_yet',
    verified: true,
    lastVerifiedAt: new Date().toISOString(),
    avgConfidence: 0.9,
    price: price(500),
    supportedTypes: ['small_tent', 'large_tent'],
    maxPeople: 4,
    featured: false,
    ...overrides,
  };
}

describe('rankProviders', () => {
  it('excludes providers that cannot host the stay type or party size', () => {
    const ranked = rankProviders(
      [
        provider({ id: 'tent', slug: 'tent', supportedTypes: ['small_tent'], maxPeople: 2 }),
        provider({ id: 'camper', slug: 'camper', supportedTypes: ['camper'], maxPeople: 4 }),
        provider({ id: 'too-small', slug: 'too-small', supportedTypes: ['small_tent'], maxPeople: 1 }),
      ],
      { stayType: 'tent', partySize: 2, preferences: [] }
    );

    assert.deepEqual(
      ranked.map((item) => item.id),
      ['tent']
    );
  });

  it('marks at most three results as primary matches and prefers closer quiet camps', () => {
    const ranked = rankProviders(
      [
        provider({
          id: 'far-loud',
          slug: 'far-loud',
          distanceKm: 25,
          cyclingMinutes: 80,
          amenityIds: ['social_area', 'showers'],
          price: price(400),
        }),
        provider({
          id: 'close-quiet',
          slug: 'close-quiet',
          distanceKm: 4,
          cyclingMinutes: 12,
          amenityIds: ['quiet_area', 'electricity', 'showers'],
          price: price(480),
        }),
        provider({
          id: 'mid',
          slug: 'mid',
          distanceKm: 12,
          cyclingMinutes: 35,
          amenityIds: ['quiet_area', 'showers'],
          price: price(450),
        }),
        provider({
          id: 'also',
          slug: 'also',
          distanceKm: 14,
          cyclingMinutes: 40,
          amenityIds: ['showers'],
          price: price(430),
        }),
      ],
      { stayType: 'tent', partySize: 2, preferences: ['close_to_start', 'quiet'] }
    );

    assert.equal(ranked[0].id, 'close-quiet');
    assert.equal(ranked.filter((item) => item.primary).length, 3);
    assert.equal(ranked[3].primary, false);
    assert.ok(ranked[0].matchPercent >= ranked[1].matchPercent);
  });

  it('does not treat featured listings as unmarked organic winners', () => {
    const ranked = rankProviders(
      [
        provider({
          id: 'cheap-close',
          slug: 'cheap-close',
          distanceKm: 5,
          cyclingMinutes: 15,
          price: price(300),
          featured: false,
        }),
        provider({
          id: 'sponsored',
          slug: 'sponsored',
          distanceKm: 20,
          cyclingMinutes: 55,
          price: price(900),
          featured: true,
        }),
      ],
      { stayType: 'tent', partySize: 2, preferences: ['lowest_price', 'close_to_start'] }
    );

    assert.equal(ranked[0].id, 'cheap-close');
    assert.equal(ranked.find((item) => item.id === 'sponsored')?.sponsored, false);
  });
});
