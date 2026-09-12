import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyMutation } from './policy.ts';

describe('classifyMutation', () => {
  it('never auto-applies provider deletion', () => {
    const result = classifyMutation({
      field: 'provider_delete',
      action: 'delete',
      oldValue: 'active',
      newValue: null,
      confidenceScore: 1,
      sourceUrl: 'https://example.com',
    });
    assert.equal(result.decision, 'pending_review');
  });

  it('auto-applies a modest price change with source and high confidence', () => {
    const result = classifyMutation({
      field: 'price',
      oldValue: 175,
      newValue: 195,
      confidenceScore: 0.98,
      sourceUrl: 'https://example.com/prices',
    });
    assert.equal(result.decision, 'auto_apply');
  });

  it('sends price changes above 40% to review even with high confidence', () => {
    const result = classifyMutation({
      field: 'price',
      oldValue: 175,
      newValue: 260,
      confidenceScore: 0.99,
      sourceUrl: 'https://example.com/prices',
    });
    assert.equal(result.decision, 'pending_review');
  });

  it('requires a source URL for availability changes', () => {
    const result = classifyMutation({
      field: 'availability',
      oldValue: 'unknown',
      newValue: 'available',
      confidenceScore: 0.99,
    });
    assert.equal(result.decision, 'pending_review');
  });
});
