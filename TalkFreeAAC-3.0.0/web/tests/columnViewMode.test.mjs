import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLUMN_VIEW_MODES,
  nextColumnViewMode,
  visibleColumnDefinitions
} from '../src/board/columnViewMode.js';
import { STAGE_PATHS } from '../src/board/constants.js';

test('single-column mode contains only the current AXIS step', () => {
  assert.deepEqual(
    visibleColumnDefinitions(COLUMN_VIEW_MODES.SINGLE, 4, 3).map(({ id }) => id),
    [3]
  );
});

test('all-columns mode exposes only the columns in the selected stage path', () => {
  for (const stage of [1, 2, 3, 4]) {
    assert.deepEqual(
      visibleColumnDefinitions(COLUMN_VIEW_MODES.ALL, stage, 1).map(({ id }) => id),
      STAGE_PATHS[stage]
    );
  }
});

test('view button toggles deterministically between one and all columns', () => {
  assert.equal(nextColumnViewMode(COLUMN_VIEW_MODES.SINGLE), COLUMN_VIEW_MODES.ALL);
  assert.equal(nextColumnViewMode(COLUMN_VIEW_MODES.ALL), COLUMN_VIEW_MODES.SINGLE);
});
