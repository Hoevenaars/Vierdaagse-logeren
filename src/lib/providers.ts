import { providers } from '../data/providers.ts';
import type { Provider } from '../../packages/database/src/index.ts';

export function getAllProviders(): Provider[] {
  return providers;
}

export function getPublishedProviders(): Provider[] {
  return providers.filter((provider) => provider.status === 'active' || provider.status === 'sold_out');
}

export function getProviderBySlug(slug: string): Provider | undefined {
  return getPublishedProviders().find((provider) => provider.slug === slug);
}

export function getProviderCities(): Array<{ slug: string; name: string; count: number }> {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const provider of getPublishedProviders()) {
    const current = map.get(provider.citySlug);
    if (current) {
      current.count += 1;
    } else {
      map.set(provider.citySlug, { slug: provider.citySlug, name: provider.city, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'nl'));
}

export function getProvidersByCity(citySlug: string): Provider[] {
  return getPublishedProviders().filter((provider) => provider.citySlug === citySlug);
}

export function averageConfidence(provider: Provider): number {
  const scores = [
    ...provider.pricingRules.map((rule) => rule.confidenceScore),
    ...provider.amenities.map((amenity) => amenity.confidenceScore),
    ...provider.availability.map((item) => item.confidenceScore),
  ].filter((score): score is number => score != null);

  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}
