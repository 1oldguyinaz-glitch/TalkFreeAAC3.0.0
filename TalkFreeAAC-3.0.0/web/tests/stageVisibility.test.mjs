import test from 'node:test';
import assert from 'node:assert/strict';
import { getBucketPage } from '../src/board/catalogSelectors.js';
import { loadCompiledCatalog } from './helpers/loadCompiledCatalog.mjs';

const { catalog } = await loadCompiledCatalog();

function context(stage, previousColumn = 0) {
  return {
    stage,
    ageBand: 'school_age',
    previousToken: previousColumn ? { column: previousColumn, role: 'test' } : null,
    pendingVerb: null,
    sentence: []
  };
}

test('Stage 1 exposes only the 1 to 2 to 6 language path', () => {
  assert.ok(getBucketPage(catalog, 1, 1, context(1)).items.length > 0);
  assert.ok(getBucketPage(catalog, 2, 1, context(1, 1)).items.length > 0);
  assert.equal(getBucketPage(catalog, 3, 1, context(1, 2)).items.length, 0);
  assert.equal(getBucketPage(catalog, 4, 1, context(1, 2)).items.length, 0);
  assert.equal(getBucketPage(catalog, 5, 1, context(1, 2)).items.length, 0);
  assert.ok(getBucketPage(catalog, 6, 1, context(1, 2)).items.length > 0);
});

test('Stages progressively expose describers, ownership, then modifiers', () => {
  assert.ok(getBucketPage(catalog, 5, 1, context(2, 2)).items.length > 0);
  assert.equal(getBucketPage(catalog, 4, 1, context(2, 2)).items.length, 0);
  assert.ok(getBucketPage(catalog, 4, 1, context(3, 2)).items.length > 0);
  assert.equal(getBucketPage(catalog, 3, 1, context(3, 2)).items.length, 0);
  assert.ok(getBucketPage(catalog, 3, 1, context(4, 2)).items.length > 0);
});

test('Stage 4 exposes every bucket and every bucketed word', () => {
  for (let column = 1; column <= 6; column += 1) {
    for (const bucket of catalog[column].buckets) {
      assert.ok(bucket.visibleByStage.includes(4), bucket.id);
      for (const word of bucket.words) {
        assert.ok(word.visibleByStage.includes(4), word.id);
      }
    }
  }
});
