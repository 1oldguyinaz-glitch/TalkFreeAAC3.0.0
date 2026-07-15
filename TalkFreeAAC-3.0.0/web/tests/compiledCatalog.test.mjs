import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCompiledCatalog } from './helpers/loadCompiledCatalog.mjs';
import { GRAMMAR_PROFILES } from '../src/data/grammarProfiles.js';

test('every one of the 10,000 source records is accounted for exactly once', async () => {
  const { manifest, catalog, wordsPayloads } = await loadCompiledCatalog();
  const ids = [];

  for (let column = 1; column <= 6; column += 1) {
    for (const bucket of catalog[column].buckets) {
      ids.push(...bucket.words.map((word) => word.id));
    }
    ids.push(...wordsPayloads[column].alwaysActiveEntries.map((entry) => entry.sourceId));
  }

  assert.equal(ids.length, 10000);
  assert.equal(new Set(ids).size, 10000);
  assert.equal(manifest.totalSourceEntries, 10000);
});

test('all grammar profile references resolve', async () => {
  const { catalog } = await loadCompiledCatalog();

  for (let column = 1; column <= 6; column += 1) {
    for (const bucket of catalog[column].buckets) {
      for (const word of bucket.words) {
        if (word.grammarProfileId) {
          assert.ok(
            GRAMMAR_PROFILES[word.grammarProfileId],
            `${word.id}: ${word.grammarProfileId}`
          );
        }
      }
    }
  }
});

test('root bucket and word coordinates are unique within their fixed grids', async () => {
  const { catalog } = await loadCompiledCatalog();

  for (let column = 1; column <= 6; column += 1) {
    const rootCoordinates = new Set();
    for (const bucket of catalog[column].buckets) {
      const rootCoordinate = `${bucket.page}:${bucket.slot}`;
      assert.equal(rootCoordinates.has(rootCoordinate), false, rootCoordinate);
      rootCoordinates.add(rootCoordinate);

      const wordCoordinates = new Set();
      for (const word of bucket.words) {
        const wordCoordinate = `${word.page}:${word.slot}`;
        assert.equal(
          wordCoordinates.has(wordCoordinate),
          false,
          `${bucket.id}:${wordCoordinate}`
        );
        wordCoordinates.add(wordCoordinate);
      }
    }
  }
});
