import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPANDED_STAGE_ONE_ROOT_LABELS,
  OLDER_AGE_BUCKET_LABEL_CONTRACT,
  SCHOOL_STAGE_ONE_ROOT_LABELS,
  requiredRootLabels
} from '../src/data/bucketLabelContract.js';
import { SCHOOL_AGE_STAGE_1_CATALOG } from '../src/data/schoolAgeStage1Catalog.js';
import { TEEN_STAGE_1_CATALOG } from '../src/data/teenStage1Catalog.js';

function roots(catalog, column) {
  return catalog[column].buckets
    .filter((bucket) => !bucket.parentBucketId)
    .map((bucket) => bucket.label);
}

test('School Stage 1 supplies the frozen School bucket addresses', () => {
  for (const column of [1, 2, 6]) {
    assert.deepEqual(
      roots(SCHOOL_AGE_STAGE_1_CATALOG, column),
      SCHOOL_STAGE_ONE_ROOT_LABELS[column]
    );
  }
});

test('Teen Stage 1 supplies the expanded Teen bucket addresses', () => {
  for (const column of [1, 2, 6]) {
    assert.deepEqual(
      roots(TEEN_STAGE_1_CATALOG, column),
      EXPANDED_STAGE_ONE_ROOT_LABELS[column]
    );
  }
});

test('Adult reuses Teen root labels instead of inventing new addresses', () => {
  for (const column of [1, 2, 6]) {
    assert.deepEqual(
      requiredRootLabels('adult', column),
      requiredRootLabels('teen', column)
    );
  }
});

test('older age contracts preserve shared labels exactly', () => {
  assert.deepEqual(Object.keys(OLDER_AGE_BUCKET_LABEL_CONTRACT), [
    'school_age',
    'teen',
    'adult'
  ]);
  assert.deepEqual(
    requiredRootLabels('school_age', 1),
    requiredRootLabels('teen', 1)
  );
  assert.deepEqual(
    requiredRootLabels('school_age', 6),
    requiredRootLabels('adult', 6)
  );
});
