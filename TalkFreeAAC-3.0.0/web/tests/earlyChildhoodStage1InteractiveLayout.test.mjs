import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SINGLE_ACTIVE_COLUMN_BUCKET_SLOT_COUNT,
  SINGLE_ACTIVE_COLUMN_WORD_SLOT_COUNT
} from '../src/board/constants.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function source(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

test('settings contains communication stage and age band controls', () => {
  const settings = source('src/board/BoardSettings.jsx');

  assert.match(settings, />Settings</);
  assert.match(settings, />Communication stage</);
  assert.match(settings, />Age band</);
  assert.match(settings, /onStageChange/);
  assert.match(settings, /onAgeBandChange/);
});

test('main board keeps sentence and interrupt controls without the stage description block', () => {
  const board = source('src/board/Board.jsx');

  assert.match(board, /<SentenceBar/);
  assert.match(board, /<InterruptRow/);
  assert.match(board, /<BoardSettings/);
  assert.doesNotMatch(board, /stageDescription/);
  assert.doesNotMatch(board, /Six-Column Board Core/);
});

test('Early Childhood and School Age Stage 1 render only the current active column', () => {
  const board = source('src/board/Board.jsx');

  assert.match(
    board,
    /state\.ageBand === 'early_childhood' && state\.stage === 1/
  );
  assert.match(
    board,
    /state\.ageBand === 'school_age' && state\.stage === 1/
  );
  assert.match(
    board,
    /COLUMN_DEFINITIONS\.filter\([\s\S]*definition\.id === state\.activeColumn/
  );
  assert.match(board, /singleColumnMode=\{usesSingleColumnStageOne\}/);
  assert.match(board, /singleActiveColumnGrid/);
});

test('single active column exposes fixed capacity for all approved Stage 1 choices', () => {
  assert.equal(SINGLE_ACTIVE_COLUMN_BUCKET_SLOT_COUNT, 8);
  assert.equal(SINGLE_ACTIVE_COLUMN_WORD_SLOT_COUNT, 16);

  const column = source('src/board/BoardColumn.jsx');
  assert.match(column, /SINGLE_ACTIVE_COLUMN_BUCKET_SLOT_COUNT/);
  assert.match(column, /SINGLE_ACTIVE_COLUMN_WORD_SLOT_COUNT/);
  assert.match(column, /singleColumnMode \? null/);
});

test('single active column uses the available viewport without board scrolling', () => {
  const css = source('src/board/board.css');

  assert.match(css, /\.boardShellSingleColumn\s*\{[\s\S]*height:\s*100dvh/);
  assert.match(css, /\.boardShellSingleColumn\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.singleActiveColumnGrid\s*\{[\s\S]*height:\s*100%/);
  assert.match(
    css,
    /\.boardColumnSingle \.columnBodyWords \.fixedSlotGrid\s*\{[\s\S]*repeat\(4/
  );
});
