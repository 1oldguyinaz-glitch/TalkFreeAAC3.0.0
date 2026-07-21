import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boardReducer,
  createInitialBoardState,
  isColumnInteractive
} from '../src/board/boardMachine.js';
import { BOARD_CATALOG } from '../src/data/boardCatalog.js';
import { GRAMMAR_PROFILES } from '../src/data/grammarProfiles.js';
import { INTERRUPTS } from '../src/board/constants.js';

function findWord(column, bucketId, wordId) {
  const bucket = BOARD_CATALOG[column].buckets.find((item) => item.id === bucketId);
  return bucket.words.find((item) => item.id === wordId);
}

function openBucket(state, column, bucketId) {
  const bucket = BOARD_CATALOG[column].buckets.find((item) => item.id === bucketId);
  return boardReducer(state, {
    type: 'OPEN_BUCKET',
    column,
    bucketId,
    bucketLabel: bucket.label
  });
}

function chooseWord(state, column, bucketId, wordId) {
  return boardReducer(state, {
    type: 'SELECT_WORD',
    column,
    word: findWord(column, bucketId, wordId)
  });
}

test('board defaults to Stage 1 with only Column 1 active and every column at bucket roots', () => {
  const state = createInitialBoardState();
  assert.equal(state.stage, 1);
  assert.equal(state.activeColumn, 1);
  for (let column = 1; column <= 6; column += 1) {
    assert.equal(state.columnViews[column].mode, 'buckets');
  }
});

test('opening a bucket updates only the active column view in a hard-gated stage', () => {
  const initial = createInitialBoardState(3);
  const next = openBucket(initial, 1, 'c1_people');
  assert.equal(next.columnViews[1].mode, 'words');
  for (let column = 2; column <= 6; column += 1) {
    assert.deepEqual(next.columnViews[column], initial.columnViews[column]);
  }
});

test('Stage 1 follows 1 to 2 to 6 and does not open the modifier grammar overlay', () => {
  let state = createInitialBoardState(1);
  state = openBucket(state, 1, 'c1_people');
  state = chooseWord(state, 1, 'c1_people', 'i');
  assert.equal(state.activeColumn, 2);

  state = openBucket(state, 2, 'c2_needs');
  state = chooseWord(state, 2, 'c2_needs', 'want');
  assert.equal(state.activeColumn, 6);
  assert.equal(state.pendingVerb, null);
  assert.equal(state.columnViews[3].mode, 'buckets');
  assert.equal(state.sentence.map((token) => token.text).join(' '), 'i want');
});

test('Stage 2 follows 1 to 2 to 5 to 6', () => {
  let state = createInitialBoardState(2);
  state = openBucket(state, 1, 'c1_people');
  state = chooseWord(state, 1, 'c1_people', 'i');
  state = openBucket(state, 2, 'c2_needs');
  state = chooseWord(state, 2, 'c2_needs', 'want');
  assert.equal(state.activeColumn, 5);
  state = openBucket(state, 5, 'c5_size');
  state = chooseWord(state, 5, 'c5_size', 'big');
  assert.equal(state.activeColumn, 6);
});

test('Stage 3 follows 1 to 2 to 4 to 5 to 6', () => {
  let state = createInitialBoardState(3);
  state = openBucket(state, 1, 'c1_people');
  state = chooseWord(state, 1, 'c1_people', 'i');
  state = openBucket(state, 2, 'c2_needs');
  state = chooseWord(state, 2, 'c2_needs', 'want');
  assert.equal(state.activeColumn, 4);
  state = openBucket(state, 4, 'c4_possessive_determiners');
  state = chooseWord(state, 4, 'c4_possessive_determiners', 'my');
  assert.equal(state.activeColumn, 5);
  state = openBucket(state, 5, 'c5_size');
  state = chooseWord(state, 5, 'c5_size', 'big');
  assert.equal(state.activeColumn, 6);
});

test('Stage 4 keeps only its active AXIS column interactive', () => {
  const state = createInitialBoardState(4);
  for (let column = 1; column <= 6; column += 1) {
    assert.equal(isColumnInteractive(state, column), column === 1);
  }

  const ignored = openBucket(state, 6, 'c6_food');
  assert.deepEqual(ignored, state);
});

test('Stage 4 grammar selection overwrites the pending verb instead of appending a duplicate', () => {
  let state = createInitialBoardState(4);
  state = openBucket(state, 1, 'c1_people');
  state = chooseWord(state, 1, 'c1_people', 'i');
  state = openBucket(state, 2, 'c2_needs');
  state = chooseWord(state, 2, 'c2_needs', 'want');
  assert.equal(state.activeColumn, 3);
  assert.equal(state.sentence.at(-1).pending, true);

  state = boardReducer(state, {
    type: 'SELECT_GRAMMAR',
    variant: GRAMMAR_PROFILES.grammar_want.variants.find((variant) => variant.form === 'past')
  });
  assert.equal(state.sentence.map((token) => token.text).join(' '), 'i wanted');
  assert.equal(state.sentence.length, 2);
  assert.equal(state.pendingVerb, null);
  assert.equal(state.columnViews[3].mode, 'buckets');
  assert.equal(state.activeColumn, 4);
});

test('Stage 4 does not allow another column to bypass the grammar step', () => {
  let state = createInitialBoardState(4);
  state = openBucket(state, 1, 'c1_people');
  state = chooseWord(state, 1, 'c1_people', 'i');
  state = openBucket(state, 2, 'c2_needs');
  state = chooseWord(state, 2, 'c2_needs', 'want');
  assert.equal(state.pendingVerb?.sourceWord.id, 'want');

  const ignored = openBucket(state, 6, 'c6_food');
  assert.deepEqual(ignored, state);
  assert.equal(ignored.activeColumn, 3);
  assert.equal(ignored.sentence.at(-1).pending, true);
});

test('hard-gated slam-shut target appends the noun and resets every column to roots', () => {
  let state = createInitialBoardState(3);
  state = { ...state, activeColumn: 6 };
  state = openBucket(state, 6, 'c6_food');
  state = chooseWord(state, 6, 'c6_food', 'apple');
  assert.equal(state.sentence.at(-1).text, 'apple');
  assert.equal(state.activeColumn, 1);
  for (let column = 1; column <= 6; column += 1) {
    assert.equal(state.columnViews[column].mode, 'buckets');
  }
});

test('Stage 4 target finishes the sentence and resets every column to roots', () => {
  let state = createInitialBoardState(4);
  state = openBucket(state, 1, 'c1_people');
  state = chooseWord(state, 1, 'c1_people', 'i');
  state = openBucket(state, 2, 'c2_needs');
  state = chooseWord(state, 2, 'c2_needs', 'want');
  state = boardReducer(state, {
    type: 'SELECT_GRAMMAR',
    variant: GRAMMAR_PROFILES.grammar_want.variants[0]
  });
  state = openBucket(state, 4, 'c4_possessive_determiners');
  state = chooseWord(state, 4, 'c4_possessive_determiners', 'my');
  state = openBucket(state, 5, 'c5_size');
  state = chooseWord(state, 5, 'c5_size', 'big');
  state = openBucket(state, 6, 'c6_food');
  state = chooseWord(state, 6, 'c6_food', 'apple');

  assert.equal(state.sentence.at(-1).text, 'apple');
  assert.equal(state.activeColumn, 1);
  for (let column = 1; column <= 6; column += 1) {
    assert.equal(state.columnViews[column].mode, 'buckets');
  }
});

test('interrupt controls work without changing the suggested or active column', () => {
  const initial = { ...createInitialBoardState(3), activeColumn: 4 };
  const yes = INTERRUPTS.find((interrupt) => interrupt.id === 'yes');
  const next = boardReducer(initial, { type: 'INTERRUPT', interrupt: yes });
  assert.equal(next.activeColumn, 4);
  assert.equal(next.sentence.at(-1).text, 'yes');
});

test('changing age band resets the path while preserving stage', () => {
  const state = createInitialBoardState(3, 'school_age');
  const changed = boardReducer(state, { type: 'SET_AGE_BAND', ageBand: 'adult' });
  assert.equal(changed.stage, 3);
  assert.equal(changed.ageBand, 'adult');
  assert.equal(changed.activeColumn, 1);
  assert.deepEqual(changed.sentence, []);
});
