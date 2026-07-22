import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCanonicalBucketHierarchy,
  CANONICAL_BUCKET_GROUPS
} from '../src/data/catalogHierarchy.js';
import { getBucketPage } from '../src/board/catalogSelectors.js';
import { STAGE_PATHS } from '../src/board/constants.js';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, '..');

function sourceCatalog(column) {
  return JSON.parse(readFileSync(
    join(webRoot, 'public', 'catalog', 'columns', `column${column}.directory.json`),
    'utf8'
  ));
}

function reachableBucketIds(catalog) {
  const byId = new Map(catalog.buckets.map((bucket) => [bucket.id, bucket]));
  const pending = catalog.buckets
    .filter((bucket) => !bucket.parentBucketId)
    .map((bucket) => bucket.id);
  const visited = new Set();

  while (pending.length) {
    const id = pending.pop();
    if (visited.has(id)) continue;
    visited.add(id);
    const bucket = byId.get(id);
    for (const word of bucket?.words ?? []) {
      if (word.targetBucketId) pending.push(word.targetBucketId);
    }
  }

  return visited;
}

test('compiled catalogs preserve every original bucket in a reachable hierarchy', () => {
  for (let column = 1; column <= 6; column += 1) {
    const source = sourceCatalog(column);
    const built = buildCanonicalBucketHierarchy(source);
    const sourceIds = new Set(source.buckets.map((bucket) => bucket.id));
    const builtIds = built.buckets.map((bucket) => bucket.id);
    const reachable = reachableBucketIds(built);

    assert.equal(new Set(builtIds).size, builtIds.length, `Column ${column} duplicate ID`);
    assert.equal(
      built.buckets.filter((bucket) => sourceIds.has(bucket.id)).length,
      source.buckets.length,
      `Column ${column} original bucket count`
    );
    for (const id of sourceIds) {
      assert.equal(reachable.has(id), true, `Column ${column} unreachable ${id}`);
    }
  }
});

test('canonical roots are concise and every navigation level fits one screen', () => {
  for (let column = 1; column <= 6; column += 1) {
    const built = buildCanonicalBucketHierarchy(sourceCatalog(column));
    const roots = built.buckets.filter((bucket) => !bucket.parentBucketId);
    const virtuals = built.buckets.filter((bucket) => bucket.virtualBucket);

    assert.ok(roots.length <= 12, `Column ${column} root count`);
    assert.equal(
      roots.some((bucket) => bucket.label === 'More'),
      false,
      `Column ${column} has an unclassified root`
    );
    for (const bucket of virtuals) {
      assert.ok(bucket.words.length <= 16, `${bucket.label} navigation count`);
      assert.deepEqual(bucket.words.map((word) => word.page), bucket.words.map(() => 1));
      assert.deepEqual(
        bucket.words.map((word) => word.slot),
        bucket.words.map((_, index) => index + 1)
      );
    }
  }
});

test('Column 6 mirrors the complete Stage 1 target-topic structure', () => {
  const built = buildCanonicalBucketHierarchy(sourceCatalog(6));
  const labels = built.buckets
    .filter((bucket) => !bucket.parentBucketId)
    .map((bucket) => bucket.label);

  assert.deepEqual(
    labels,
    CANONICAL_BUCKET_GROUPS[6].map((group) => group.label)
  );
  assert.deepEqual(labels, [
    'Food and Drink',
    'People',
    'Feelings',
    'Play',
    'Places',
    'Care',
    'Body Parts',
    'Things',
    'School',
    'Clothes',
    'Technology',
    'Control'
  ]);
});

test('compiled hierarchy roots remain visible in every older age and stage path', () => {
  for (const ageBand of ['school_age', 'teen', 'adult']) {
    for (let stage = 1; stage <= 4; stage += 1) {
      const path = STAGE_PATHS[stage];
      for (let index = 0; index < path.length; index += 1) {
        const column = path[index];
        const catalog = {
          [column]: buildCanonicalBucketHierarchy(sourceCatalog(column))
        };
        const previousColumn = index === 0 ? 0 : path[index - 1];
        const context = {
          stage,
          ageBand,
          previousToken: previousColumn
            ? { column: previousColumn, role: 'axis_previous' }
            : null,
          pendingVerb: null,
          sentence: [],
          contentSettings: { showSchool: true, showPrivateParts: true }
        };

        assert.ok(
          getBucketPage(catalog, column, 1, context).items.length > 0,
          `${ageBand} Stage ${stage} Column ${column}`
        );
      }
    }
  }
});
