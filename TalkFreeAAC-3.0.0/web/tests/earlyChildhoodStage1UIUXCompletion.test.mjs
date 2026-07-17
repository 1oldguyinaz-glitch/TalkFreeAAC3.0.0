import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EARLY_CHILDHOOD_STAGE_ONE_INTERRUPTS,
  INTERRUPTS
} from '../src/board/constants.js';
import {
  boardReducer,
  createInitialBoardState
} from '../src/board/boardMachine.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function source(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

test('baseline controls remain unchanged outside Early Childhood Stage 1', () => {
  assert.deepEqual(
    INTERRUPTS.map((item) => item.label),
    ['Yes', 'No', 'Help', 'Stop', 'Clear']
  );
});

test('Stage 1 adds only the two approved quick phrases', () => {
  assert.deepEqual(
    EARLY_CHILDHOOD_STAGE_ONE_INTERRUPTS.map((item) => item.label),
    ['Yes', 'No', 'Help', 'Please', 'No Thank You', 'Stop', 'Clear']
  );

  assert.equal(
    EARLY_CHILDHOOD_STAGE_ONE_INTERRUPTS.find(
      (item) => item.label === 'No Thank You'
    )?.spoken,
    'no thank you'
  );
});

test('No Thank You is added as one phrase token', () => {
  const phrase = EARLY_CHILDHOOD_STAGE_ONE_INTERRUPTS.find(
    (item) => item.label === 'No Thank You'
  );
  const state = boardReducer(
    createInitialBoardState(1, 'early_childhood'),
    { type: 'INTERRUPT', interrupt: phrase }
  );

  assert.equal(state.sentence.length, 1);
  assert.equal(state.sentence[0].text, 'no thank you');
  assert.equal(state.sentence[0].label, 'No Thank You');
});

test('Stage 1 activates the larger sentence and quick-control presentation', () => {
  const board = source('src/board/Board.jsx');
  const sentence = source('src/board/SentenceBar.jsx');
  const interrupts = source('src/board/InterruptRow.jsx');

  assert.match(board, /stageOneMode=\{usesSingleColumnStageOne\}/);
  assert.match(board, /boardUtilityRowStageOne/);
  assert.match(sentence, /sentenceBarStageOne/);
  assert.match(sentence, /speakButton/);
  assert.doesNotMatch(sentence, /undoButton|resetPathButton|Reset Path|Undo/);
  assert.equal((sentence.match(/sentenceActionButton/g) ?? []).length, 1);
  assert.match(interrupts, /interruptRowStageOne/);
});

test('Clear replaces the separate board Back button', () => {
  const column = source('src/board/BoardColumn.jsx');
  const interrupts = source('src/board/InterruptRow.jsx');

  assert.doesNotMatch(column, /className="backButton"/);
  assert.match(interrupts, /Clear the last choice and return to the previous board view/);
});

test('Stage 1 UI controls have enlarged typography and touch targets', () => {
  const css = source('src/board/board.css');

  assert.match(
    css,
    /\.boardShellSingleColumn \.sentenceBarStageOne[\s\S]*min-height:\s*6rem/
  );
  assert.match(
    css,
    /\.boardShellSingleColumn \.sentenceBarStageOne \.speakButton[\s\S]*min-height:\s*4\.65rem/
  );
  assert.match(
    css,
    /\.boardUtilityRowStageOne \.interruptButton[\s\S]*font-weight:\s*900/
  );
  assert.match(
    css,
    /\.columnToolbarTopicOnly[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/
  );
});

test('Settings source is not part of this UI/UX change', () => {
  const settings = source('src/board/BoardSettings.jsx');

  assert.doesNotMatch(settings, /Please|No Thank You|quick phrase/i);
});
