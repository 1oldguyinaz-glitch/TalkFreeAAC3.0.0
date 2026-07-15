import test from 'node:test';
import assert from 'node:assert/strict';
import { boardReducer, createInitialBoardState } from '../src/board/boardMachine.js';
import { SCHOOL_AGE_STAGE_1_CATALOG } from '../src/data/schoolAgeStage1Catalog.js';

function findWord(column, label) {
  return SCHOOL_AGE_STAGE_1_CATALOG[column].buckets
    .flatMap((bucket) => bucket.words)
    .find((word) => word.label === label);
}

function select(state, label, column) {
  const word = findWord(column, label);
  assert.ok(word, `${label} missing from Column ${column}`);
  return boardReducer(state, { type: 'SELECT_WORD', column, word });
}

function sentence(state) {
  return state.sentence.map((token) => token.text).join(' ');
}

test('School Age Stage 1 supports direct target and second-action choices after want', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 'I', 1);
  state = select(state, 'want', 2);
  assert.equal(state.activeColumn, 2);
  assert.equal(state.targetAdvanceAvailable, true);
  state = boardReducer(state, { type: 'ADVANCE_TO_TARGETS' });
  assert.equal(state.activeColumn, 6);
  state = select(state, 'water', 6);
  assert.equal(sentence(state), 'I want water');
  assert.equal(state.activeColumn, 1);
});

test('like can continue to an action before the target', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 'I', 1);
  state = select(state, 'like', 2);
  state = select(state, 'read', 2);
  assert.equal(state.activeColumn, 6);
  state = select(state, 'book', 6);
  assert.equal(sentence(state), 'I like read book');
});

test("don't and can't keep Actions active without offering a bare noun target", () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 'I', 1);
  state = select(state, "don't", 2);
  assert.equal(state.activeColumn, 2);
  assert.equal(state.targetAdvanceAvailable, false);
  state = select(state, 'want', 2);
  assert.equal(state.targetAdvanceAvailable, true);
  state = boardReducer(state, { type: 'ADVANCE_TO_TARGETS' });
  state = select(state, 'homework', 6);
  assert.equal(sentence(state), "I don't want homework");

  state = createInitialBoardState(1, 'school_age');
  state = select(state, 'I', 1);
  state = select(state, "can't", 2);
  state = select(state, 'breathe', 2);
  assert.equal(sentence(state), "I can't breathe");
  assert.equal(state.activeColumn, 1);
});

test('target question frames bypass Actions and go directly to Column 6', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 'Where is', 1);
  assert.equal(state.activeColumn, 6);
  state = select(state, 'bathroom', 6);
  assert.equal(sentence(state), 'Where is bathroom');
});

test('terminal actions return to Start while target-taking actions activate Column 6', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 'I', 1);
  state = select(state, 'understand', 2);
  assert.equal(state.activeColumn, 1);
  assert.equal(sentence(state), 'I understand');

  state = createInitialBoardState(1, 'school_age');
  state = select(state, 'I', 1);
  state = select(state, 'feel', 2);
  assert.equal(state.activeColumn, 6);
  state = select(state, 'pain', 6);
  assert.equal(sentence(state), 'I feel pain');
});

test('spoken output applies third-person agreement but keeps base verbs after auxiliaries', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 'she', 1);
  state = select(state, 'want', 2);
  assert.equal(sentence(state), 'she wants');
  state = boardReducer(state, { type: 'ADVANCE_TO_TARGETS' });
  state = select(state, 'water', 6);
  assert.equal(sentence(state), 'she wants water');

  state = createInitialBoardState(1, 'school_age');
  state = select(state, 'teacher', 1);
  state = select(state, 'help', 2);
  state = select(state, 'me', 6);
  assert.equal(sentence(state), 'teacher helps me');

  state = createInitialBoardState(1, 'school_age');
  state = select(state, 'she', 1);
  state = select(state, "don't", 2);
  state = select(state, 'want', 2);
  assert.equal(sentence(state), "she doesn't want");
});

test('multiword action units remain one selectable token', () => {
  for (const label of ['look at', 'listen to', 'turn on', 'turn off', 'try again', 'calm down']) {
    const word = findWord(2, label);
    assert.ok(word);
    assert.equal(word.label, label);
  }
});
