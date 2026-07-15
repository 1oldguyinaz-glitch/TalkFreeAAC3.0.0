import test from 'node:test';
import assert from 'node:assert/strict';
import { getColumnCongruenceMatrix, isColumnCongruent } from '../src/board/congruence.js';
import { STAGE_PATHS } from '../src/board/constants.js';

test('stage paths exactly match the progressive six-column design', () => {
  assert.deepEqual(STAGE_PATHS[1], [1, 2, 6]);
  assert.deepEqual(STAGE_PATHS[2], [1, 2, 5, 6]);
  assert.deepEqual(STAGE_PATHS[3], [1, 2, 4, 5, 6]);
  assert.deepEqual(STAGE_PATHS[4], [1, 2, 3, 4, 5, 6]);
});

test('column congruence is directional and stage specific', () => {
  assert.equal(isColumnCongruent(1, 2, 1), true);
  assert.equal(isColumnCongruent(2, 6, 1), true);
  assert.equal(isColumnCongruent(2, 5, 1), false);
  assert.equal(isColumnCongruent(2, 5, 2), true);
  assert.equal(isColumnCongruent(2, 4, 3), true);
  assert.equal(isColumnCongruent(2, 3, 4), true);
  assert.equal(isColumnCongruent(2, 1, 4), false);
});

test('matrix contains a boolean for every ordered pair', () => {
  const matrix = getColumnCongruenceMatrix(4);
  for (let from = 1; from <= 6; from += 1) {
    for (let to = 1; to <= 6; to += 1) {
      assert.equal(typeof matrix[from][to], 'boolean');
    }
  }
});
