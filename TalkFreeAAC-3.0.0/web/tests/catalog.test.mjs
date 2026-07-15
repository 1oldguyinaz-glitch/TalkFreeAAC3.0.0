import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from './helpers/catalogValidation.mjs';
import { loadCompiledCatalog } from './helpers/loadCompiledCatalog.mjs';

test('compiled 10K catalog has complete IDs, coordinates, buckets, and stage reachability', async () => {
  const { manifest, catalog } = await loadCompiledCatalog();
  const result = validateCatalog(catalog);

  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.bucketCount, 478);
  assert.equal(result.wordCount, 9995);
  assert.equal(manifest.totalAlwaysActiveControls, 5);
  assert.equal(result.wordCount + manifest.totalAlwaysActiveControls, 10000);
});
