import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const source = (relative) => readFileSync(join(repoRoot, relative), 'utf8');

test('Board loads the dedicated School Age Stage 1 catalog', () => {
  const board = source('src/board/Board.jsx');
  assert.match(board, /SCHOOL_AGE_STAGE_1_CATALOG/);
  assert.match(board, /state\.ageBand === 'school_age' && state\.stage === 1/);
  assert.match(board, /usesSingleColumnStageOne/);
  assert.match(board, /singleColumnMode=\{usesSingleColumnStageOne\}/);
});

test('School Age Stage 1 inherits the completed Stage 1 sentence and quick-control UI', () => {
  const board = source('src/board/Board.jsx');
  const interrupts = source('src/board/InterruptRow.jsx');
  assert.match(board, /stageOneMode=\{usesSingleColumnStageOne\}/);
  assert.match(board, /boardUtilityRowStageOne/);
  assert.match(interrupts, /STAGE_ONE_INTERRUPTS/);
});

test('continuation routing exposes a styled Targets control without modifying Settings', () => {
  const column = source('src/board/BoardColumn.jsx');
  const css = source('src/board/board.css');
  const settings = source('src/board/BoardSettings.jsx');
  assert.match(column, /targetAdvanceAvailable/);
  assert.match(column, />\s*Targets\s*</);
  assert.match(css, /\.targetAdvanceButton/);
  assert.doesNotMatch(settings, /Targets|School Age Stage 1|quick phrase/i);
});
