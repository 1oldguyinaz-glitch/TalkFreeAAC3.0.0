import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const source = (path) => readFileSync(join(root, path), 'utf8');

test('Board continues to load School Age Stage 1 through the finalized shared UI', () => {
  const board = source('src/board/Board.jsx');
  assert.match(board, /SCHOOL_AGE_STAGE_1_CATALOG/);
  assert.match(board, /usesSingleColumnStageOne/);
  assert.match(board, /stageOneMode=\{usesSingleColumnStageOne\}/);
});

test('patch does not introduce dedicated School Age UI or quick-access controls', () => {
  const board = source('src/board/Board.jsx');
  const interrupts = source('src/board/InterruptRow.jsx');
  const constants = source('src/board/constants.js');
  assert.doesNotMatch(board, /schoolAgeStageOneMode/);
  assert.doesNotMatch(interrupts, /SCHOOL_AGE_STAGE_ONE_INTERRUPTS/);
  assert.doesNotMatch(constants, /sa1-c6-safety|SCHOOL_AGE_STAGE_ONE_BUCKET_SLOT_COUNT|SCHOOL_AGE_STAGE_ONE_WORD_SLOT_COUNT/);
});

test('only the approved sentence-output fixed-form guard is added to runtime logic', () => {
  const machine = source('src/board/boardMachine.js');
  assert.match(machine, /state\.ageBand === 'school_age'/);
  assert.match(machine, /word\.fixedForm/);
  assert.match(machine, /return base/);
});
