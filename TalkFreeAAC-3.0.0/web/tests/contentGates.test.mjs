import test from 'node:test';
import assert from 'node:assert/strict';
import { getBucketPage } from '../src/board/catalogSelectors.js';
import { itemIsCongruent } from '../src/board/congruence.js';
import {
  boardReducer,
  createInitialBoardState
} from '../src/board/boardMachine.js';
import { TEEN_STAGE_1_CATALOG } from '../src/data/teenStage1Catalog.js';
import { loadCompiledCatalog } from './helpers/loadCompiledCatalog.mjs';

function context(contentSettings) {
  return {
    stage: 1,
    ageBand: 'teen',
    previousToken: { column: 2, role: 'verb' },
    pendingVerb: null,
    sentence: [],
    contentSettings
  };
}

const safeSettings = {
  showSchool: true,
  showPrivateParts: false
};

test('Teen Stage 1 private-parts navigation and words obey the safety gate', () => {
  const privateBucket = TEEN_STAGE_1_CATALOG[6].buckets.find(
    (bucket) => bucket.label === 'Private Parts'
  );
  const privateNavigation = TEEN_STAGE_1_CATALOG[6].buckets
    .flatMap((bucket) => bucket.words)
    .find((word) => word.targetBucketId === privateBucket.id);

  assert.ok(privateBucket);
  assert.ok(privateNavigation);
  assert.equal(privateBucket.safetyGate, 'private_parts');
  assert.equal(privateNavigation.safetyGate, 'private_parts');
  assert.equal(itemIsCongruent(privateBucket, context(safeSettings)), false);
  assert.equal(itemIsCongruent(privateNavigation, context(safeSettings)), false);

  const enabled = { ...safeSettings, showPrivateParts: true };
  assert.equal(itemIsCongruent(privateBucket, context(enabled)), true);
  assert.equal(itemIsCongruent(privateNavigation, context(enabled)), true);
  assert.ok(
    privateBucket.words.every((word) =>
      itemIsCongruent(word, context(enabled))
    )
  );
});

test('School topics can be removed from the Teen Stage 1 root board', () => {
  const schoolBucket = TEEN_STAGE_1_CATALOG[6].buckets.find(
    (bucket) => bucket.label === 'School' && !bucket.parentBucketId
  );
  const visible = getBucketPage(
    TEEN_STAGE_1_CATALOG,
    6,
    schoolBucket.page,
    context(safeSettings)
  ).items;
  assert.equal(visible.some((bucket) => bucket.label === 'School'), true);

  const hidden = getBucketPage(
    TEEN_STAGE_1_CATALOG,
    6,
    schoolBucket.page,
    context({ ...safeSettings, showSchool: false })
  ).items;
  assert.equal(hidden.some((bucket) => bucket.label === 'School'), false);
});

test('compiled private-parts words are gated without hiding urgent safety language', async () => {
  const { catalog } = await loadCompiledCatalog();
  const words = Object.values(catalog).flatMap((column) =>
    column.buckets.flatMap((bucket) => bucket.words)
  );
  const privateParts = words.find((word) => word.label === 'private parts');
  const someoneHurtMe = words.find((word) => word.label === 'Someone hurt me');
  const adultContext = {
    ...context(safeSettings),
    stage: 4,
    ageBand: 'adult',
    previousToken: null
  };

  assert.equal(itemIsCongruent(privateParts, adultContext), false);
  assert.equal(itemIsCongruent(someoneHurtMe, adultContext), true);
  assert.equal(
    itemIsCongruent(privateParts, {
      ...adultContext,
      contentSettings: { ...safeSettings, showPrivateParts: true }
    }),
    true
  );
});

test('changing a content gate safely returns the active column to categories', () => {
  let state = createInitialBoardState(1, 'teen');
  state = { ...state, activeColumn: 6 };
  state = boardReducer(state, {
    type: 'OPEN_BUCKET',
    column: 6,
    bucketId: 't1-c6-body-private',
    bucketLabel: 'Private Parts'
  });
  assert.equal(state.columnViews[6].mode, 'words');

  state = boardReducer(state, {
    type: 'SET_CONTENT_SETTING',
    setting: 'showPrivateParts',
    enabled: true,
    label: 'Private-parts vocabulary'
  });

  assert.equal(state.contentSettings.showPrivateParts, true);
  assert.equal(state.activeColumn, 6);
  assert.equal(state.columnViews[6].mode, 'buckets');
  assert.deepEqual(state.backStack, []);
});
