import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boardReducer,
  createInitialBoardState
} from '../src/board/boardMachine.js';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from '../src/data/earlyChildhoodStage1Catalog.js';
import { getBucketPage, getWordPage } from '../src/board/catalogSelectors.js';

function findWord(column, bucketId, label) {
  const bucket = EARLY_CHILDHOOD_STAGE_1_CATALOG[column].buckets
    .find((item) => item.id === bucketId);
  return bucket.words.find((word) => word.label === label);
}

function select(state, word) {
  return boardReducer(state, {
    type: 'SELECT_WORD',
    column: word.column,
    word
  });
}

function openBucket(state, column, bucketId, bucketLabel) {
  return boardReducer(state, {
    type: 'OPEN_BUCKET',
    column,
    bucketId,
    bucketLabel,
    page: 1
  });
}

function context(state) {
  return {
    stage: state.stage,
    ageBand: state.ageBand,
    previousToken: state.sentence.at(-1) ?? null,
    pendingVerb: state.pendingVerb,
    sentence: state.sentence
  };
}

test('my routes directly from Column 1 to Column 6', () => {
  const my = findWord(1, 'ec_s1_c1_core', 'my');
  let state = createInitialBoardState(1, 'early_childhood');
  state = select(state, my);

  assert.equal(state.activeColumn, 6);
  assert.equal(state.sentence.map((token) => token.text).join(' '), 'my');

  const buckets = getBucketPage(
    EARLY_CHILDHOOD_STAGE_1_CATALOG,
    6,
    1,
    context(state)
  );
  assert.ok(buckets.items.some((bucket) => bucket.label === 'Body Parts'));
  assert.ok(buckets.items.some((bucket) => bucket.label === 'Daily Objects'));
});

test("don't keeps Column 2 active for the following action", () => {
  const i = findWord(1, 'ec_s1_c1_core', 'I');
  const dont = findWord(2, 'ec_s1_c2_core', "don't");
  const want = findWord(2, 'ec_s1_c2_core', 'want');

  let state = createInitialBoardState(1, 'early_childhood');
  state = openBucket(state, 1, 'ec_s1_c1_core', 'Core Words');
  state = select(state, i);
  state = openBucket(state, 2, 'ec_s1_c2_core', 'Core Actions');
  state = select(state, dont);

  assert.equal(state.activeColumn, 2);
  assert.equal(state.sentence.map((token) => token.text).join(' '), "I don't");
  assert.equal(state.columnViews[2].mode, 'words');
  assert.equal(state.columnViews[2].bucketId, 'ec_s1_c2_core');

  const words = getWordPage(
    EARLY_CHILDHOOD_STAGE_1_CATALOG,
    2,
    state.columnViews[2].bucketId,
    state.columnViews[2].page,
    context(state)
  );
  assert.ok(words.items.some((word) => word.label === 'want'));

  state = select(state, want);
  assert.equal(state.activeColumn, 6);
  assert.equal(
    state.sentence.map((token) => token.text).join(' '),
    "I don't want"
  );
});
