import test from 'node:test';
import assert from 'node:assert/strict';
import { boardReducer, createInitialBoardState } from '../src/board/boardMachine.js';
import { SCHOOL_AGE_STAGE_1_CATALOG as C } from '../src/data/schoolAgeStage1Catalog.js';

function findWord(column, label) {
  return C[column].buckets
    .flatMap((bucket) => bucket.words)
    .find((word) => word.label === label && !word.targetBucketId);
}
function select(state, column, label) {
  const word = findWord(column, label);
  assert.ok(word, `${label} missing from Column ${column}`);
  return boardReducer(state, { type: 'SELECT_WORD', column, word });
}
const text = (state) => state.sentence.map((token) => token.text).join(' ');

const sentenceCases = [
  ['I', 'want', 'water', 'I want water'],
  ['teacher', 'helped', 'mom', 'teacher helped mom'],
  ['firefighter', 'hurt', 'dad', 'firefighter hurt dad'],
  ['classmate', 'pushed', 'me', 'classmate pushed me'],
  ['dad', 'found', 'key', 'dad found key'],
  ['coach', 'showed', 'schedule', 'coach showed schedule'],
  ['doctor', 'gave', 'medicine', 'doctor gave medicine'],
  ['friend', 'called', 'teacher', 'friend called teacher']
];

for (const [starter, action, target, expected] of sentenceCases) {
  test(`Stage 1 builds: ${expected}`, () => {
    let state = createInitialBoardState(1, 'school_age');
    state = select(state, 1, starter);
    assert.equal(state.activeColumn, 2);
    state = select(state, 2, action);
    assert.equal(state.activeColumn, 6);
    state = select(state, 6, target);
    assert.equal(text(state), expected);
    assert.equal(state.activeColumn, 1);
  });
}

test('base verbs retain existing third-person agreement', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 1, 'teacher');
  state = select(state, 2, 'help');
  state = select(state, 6, 'mom');
  assert.equal(text(state), 'teacher helps mom');
});

test('approved fixed forms do not receive incorrect third-person endings', () => {
  for (const action of ['helped', 'found', 'showed', 'gave', 'took', 'saw', 'told', 'called', 'pushed']) {
    let state = createInitialBoardState(1, 'school_age');
    state = select(state, 1, 'teacher');
    state = select(state, 2, action);
    assert.equal(text(state), `teacher ${action}`);
  }
});

test('Belongs To supports a direct ownership phrase without combining a Stage 1 subject', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 1, 'my');
  assert.equal(state.activeColumn, 6);
  state = select(state, 6, 'backpack');
  assert.equal(text(state), 'my backpack');
  assert.equal(state.activeColumn, 1);
});

test('Questions are direct Stage 1 selections and use the same connector', () => {
  let state = createInitialBoardState(1, 'school_age');
  state = select(state, 1, 'Who');
  state = select(state, 2, 'helped');
  state = select(state, 6, 'mom');
  assert.equal(text(state), 'Who helped mom');
});
