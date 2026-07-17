import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boardReducer,
  createInitialBoardState
} from '../src/board/boardMachine.js';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from '../src/data/earlyChildhoodStage1Catalog.js';
import { INTERRUPTS } from '../src/board/constants.js';
import { getBucketPage, getWordPage } from '../src/board/catalogSelectors.js';

function bucket(column, id) {
  return EARLY_CHILDHOOD_STAGE_1_CATALOG[column].buckets
    .find((item) => item.id === id);
}

function word(column, bucketId, label) {
  return bucket(column, bucketId).words.find((item) => item.label === label);
}

function open(state, column, bucketId) {
  const target = bucket(column, bucketId);
  return boardReducer(state, {
    type: 'OPEN_BUCKET',
    column,
    bucketId,
    bucketLabel: target.label,
    page: 1
  });
}

function select(state, target) {
  return boardReducer(state, {
    type: 'SELECT_WORD',
    column: target.column,
    word: target
  });
}

function clear(state) {
  const control = INTERRUPTS.find((item) => item.id === 'clear');
  return boardReducer(state, { type: 'INTERRUPT', interrupt: control });
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

test('my tummy routes to the body-state topic and produces my tummy hurts', () => {
  let state = createInitialBoardState(1, 'early_childhood');
  state = open(state, 1, 'ec_s1_c1_core');
  state = select(state, word(1, 'ec_s1_c1_core', 'my'));
  assert.equal(state.activeColumn, 6);

  state = open(state, 6, 'ec_s1_c6_body');
  state = select(state, word(6, 'ec_s1_c6_body', 'tummy'));
  assert.equal(state.activeColumn, 6);
  assert.equal(state.sentence.map((token) => token.text).join(' '), 'my tummy');

  const targetBuckets = getBucketPage(
    EARLY_CHILDHOOD_STAGE_1_CATALOG,
    6,
    1,
    context(state)
  );
  assert.ok(targetBuckets.items.some((item) => item.id === 'ec_s1_c6_feelings'));

  const bodyStates = getWordPage(
    EARLY_CHILDHOOD_STAGE_1_CATALOG,
    6,
    'ec_s1_c6_feelings',
    1,
    context(state)
  );
  assert.deepEqual(bodyStates.items.map((item) => item.label), ['hurt']);

  state = open(state, 6, 'ec_s1_c6_feelings');
  state = select(state, word(6, 'ec_s1_c6_feelings', 'hurt'));
  assert.equal(state.activeColumn, 1);
  assert.equal(
    state.sentence.map((token) => token.text).join(' '),
    'my tummy hurts'
  );
});

test('plural body parts retain natural agreement', () => {
  let state = createInitialBoardState(1, 'early_childhood');
  state = open(state, 1, 'ec_s1_c1_core');
  state = select(state, word(1, 'ec_s1_c1_core', 'my'));
  state = open(state, 6, 'ec_s1_c6_body');
  state = select(state, word(6, 'ec_s1_c6_body', 'hands'));
  state = open(state, 6, 'ec_s1_c6_feelings');
  state = select(state, word(6, 'ec_s1_c6_feelings', 'hurt'));

  assert.equal(
    state.sentence.map((token) => token.text).join(' '),
    'my hands hurt'
  );
});

test('Clear reverses the last word and restores its exact topic view', () => {
  let state = createInitialBoardState(1, 'early_childhood');
  state = open(state, 1, 'ec_s1_c1_core');
  state = select(state, word(1, 'ec_s1_c1_core', 'I'));

  assert.equal(state.activeColumn, 2);
  assert.equal(state.sentence.map((token) => token.text).join(' '), 'I');

  state = clear(state);
  assert.equal(state.activeColumn, 1);
  assert.equal(state.sentence.length, 0);
  assert.equal(state.columnViews[1].mode, 'words');
  assert.equal(state.columnViews[1].bucketId, 'ec_s1_c1_core');

  state = clear(state);
  assert.equal(state.columnViews[1].mode, 'buckets');
  assert.equal(state.sentence.length, 0);
});

test('Clear after a finished target restores the sentence and target topic', () => {
  let state = createInitialBoardState(1, 'early_childhood');
  state = open(state, 1, 'ec_s1_c1_core');
  state = select(state, word(1, 'ec_s1_c1_core', 'I'));
  state = open(state, 2, 'ec_s1_c2_core');
  state = select(state, word(2, 'ec_s1_c2_core', 'want'));
  state = open(state, 6, 'ec_s1_c6_food');
  state = select(state, word(6, 'ec_s1_c6_food', 'water'));

  assert.equal(
    state.sentence.map((token) => token.text).join(' '),
    'I want water'
  );
  assert.equal(state.activeColumn, 1);

  state = clear(state);
  assert.equal(
    state.sentence.map((token) => token.text).join(' '),
    'I want'
  );
  assert.equal(state.activeColumn, 6);
  assert.equal(state.columnViews[6].mode, 'words');
  assert.equal(state.columnViews[6].bucketId, 'ec_s1_c6_food');
});
