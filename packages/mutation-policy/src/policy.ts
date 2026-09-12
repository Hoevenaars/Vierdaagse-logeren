export type MutationField =
  | 'price'
  | 'availability'
  | 'amenity'
  | 'content'
  | 'meta_description'
  | 'status'
  | 'provider_create'
  | 'provider_delete'
  | 'commercial';

export type RiskLevel = 'low' | 'standard' | 'high';

export interface MutationProposal {
  field: MutationField;
  action?: 'update' | 'create' | 'delete';
  oldValue: unknown;
  newValue: unknown;
  confidenceScore: number;
  sourceUrl?: string | null;
}

export type PolicyDecision = 'auto_apply' | 'pending_review' | 'reject';

export interface PolicyResult {
  decision: PolicyDecision;
  reason: string;
  risk: RiskLevel;
}

const PRICE_CONFIDENCE = 0.95;
const AVAILABILITY_CONFIDENCE = 0.95;
const STANDARD_AUTO_APPLY = 0.85;
const META_CONFIDENCE = 0.8;
const PRICE_DELTA_REVIEW = 0.4;

export function classifyMutation(proposal: MutationProposal): PolicyResult {
  if (proposal.field === 'provider_delete' || proposal.action === 'delete') {
    return {
      decision: 'pending_review',
      reason: 'Providers worden nooit autonoom verwijderd.',
      risk: 'high',
    };
  }

  if (proposal.field === 'provider_create') {
    return {
      decision: 'pending_review',
      reason: 'Nieuwe providers gaan standaard naar review.',
      risk: 'high',
    };
  }

  if (proposal.field === 'commercial') {
    return {
      decision: 'pending_review',
      reason: 'Commerciële afspraken vereisen menselijke goedkeuring.',
      risk: 'high',
    };
  }

  if (proposal.confidenceScore < 0.7) {
    return {
      decision: 'pending_review',
      reason: 'Confidence onder 0.70, altijd review.',
      risk: 'high',
    };
  }

  if (proposal.field === 'price') {
    if (!proposal.sourceUrl) {
      return { decision: 'pending_review', reason: 'Prijsmutatie vereist een bron-URL.', risk: 'high' };
    }
    if (proposal.confidenceScore < PRICE_CONFIDENCE) {
      return { decision: 'pending_review', reason: 'Prijs vereist confidence ≥ 0.95.', risk: 'high' };
    }
    if (exceedsPriceDelta(proposal.oldValue, proposal.newValue)) {
      return {
        decision: 'pending_review',
        reason: 'Prijswijziging groter dan 40% gaat altijd naar review.',
        risk: 'high',
      };
    }
    return { decision: 'auto_apply', reason: 'Prijs binnen drempel, bron aanwezig.', risk: 'standard' };
  }

  if (proposal.field === 'availability') {
    if (!proposal.sourceUrl) {
      return { decision: 'pending_review', reason: 'Beschikbaarheid vereist een bron-URL.', risk: 'high' };
    }
    if (proposal.confidenceScore < AVAILABILITY_CONFIDENCE) {
      return { decision: 'pending_review', reason: 'Beschikbaarheid vereist confidence ≥ 0.95.', risk: 'high' };
    }
    return { decision: 'auto_apply', reason: 'Beschikbaarheid met hoge confidence.', risk: 'standard' };
  }

  if (proposal.field === 'meta_description') {
    if (proposal.confidenceScore < META_CONFIDENCE) {
      return { decision: 'pending_review', reason: 'Meta description vereist confidence ≥ 0.80.', risk: 'low' };
    }
    return { decision: 'auto_apply', reason: 'SEO-metadata binnen drempel.', risk: 'low' };
  }

  if (proposal.confidenceScore >= STANDARD_AUTO_APPLY) {
    return { decision: 'auto_apply', reason: 'Standaardveld met logging.', risk: 'standard' };
  }

  return {
    decision: 'pending_review',
    reason: 'Confidence tussen 0.70 en 0.85, review afhankelijk van veldtype.',
    risk: 'standard',
  };
}

function exceedsPriceDelta(oldValue: unknown, newValue: unknown): boolean {
  const oldAmount = asNumber(oldValue);
  const newAmount = asNumber(newValue);
  if (oldAmount == null || newAmount == null || oldAmount === 0) return false;
  return Math.abs(newAmount - oldAmount) / oldAmount > PRICE_DELTA_REVIEW;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object' && 'amount' in value) {
    const amount = (value as { amount: unknown }).amount;
    if (typeof amount === 'number') return amount;
  }
  return null;
}
