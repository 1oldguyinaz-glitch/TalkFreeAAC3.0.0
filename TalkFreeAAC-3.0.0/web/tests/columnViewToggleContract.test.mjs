import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

test('view control is labeled, keyboard-operable, and exposes its state', () => {
  const source = readFileSync(join(root, 'src', 'board', 'ColumnViewToggle.jsx'), 'utf8');

  assert.match(source, /type="button"/);
  assert.match(source, /aria-pressed=\{showingAll\}/);
  assert.match(source, /Show all AXIS columns and make every visible choice available/);
  assert.match(source, /Show one active AXIS column/);
  assert.match(source, /All Columns/);
  assert.match(source, /One Column/);
  assert.match(source, /Advanced access/);
});

test('all-columns mode preserves usable controls and enables every visible column', () => {
  const board = readFileSync(join(root, 'src', 'board', 'Board.jsx'), 'utf8');
  const column = readFileSync(join(root, 'src', 'board', 'BoardColumn.jsx'), 'utf8');
  const css = readFileSync(join(root, 'src', 'board', 'board.css'), 'utf8');

  assert.match(board, /allowAnyVisibleColumn = !singleColumnMode/);
  assert.match(board, /allowAnyVisibleColumn/);
  assert.match(column, /!singleColumnMode[\s\S]*behavior\.interactionMode/);
  assert.match(column, /fitToContainer=\{singleColumnMode\}/);
  assert.match(css, /minmax\(19rem,\s*1fr\)/);
  assert.match(css, /min-width:\s*7\.5rem/);
  assert.match(css, /min-height:\s*4\.5rem/);
});

test('overflowing advanced stages expose accessible horizontal navigation', () => {
  const board = readFileSync(join(root, 'src', 'board', 'Board.jsx'), 'utf8');
  const css = readFileSync(join(root, 'src', 'board', 'board.css'), 'utf8');

  assert.match(board, /aria-label="Advanced All Columns navigation"/);
  assert.match(board, /aria-controls="axis-columns-viewport"/);
  assert.match(board, />Earlier columns</);
  assert.match(board, />Later columns</);
  assert.match(board, /scrollBy/);
  assert.match(board, /onScroll=\{updateBoardScrollState\}/);
  assert.match(css, /\.boardScrollControls button[\s\S]*min-height:\s*3rem/);
});

test('all-columns labels wrap at word boundaries without shrinking touch targets', () => {
  const css = readFileSync(join(root, 'src', 'board', 'board.css'), 'utf8');

  assert.match(
    css,
    /\.boardShellAllColumns \.boardButtonLabel,[\s\S]*overflow-wrap:\s*break-word/
  );
  assert.match(css, /word-break:\s*normal/);
  assert.match(css, /hyphens:\s*none/);
  assert.match(css, /text-wrap:\s*balance/);
});

test('all-columns mode scrolls the board instead of clipping lower choices', () => {
  const css = readFileSync(join(root, 'src', 'board', 'board.css'), 'utf8');

  assert.match(
    css,
    /\.boardShellAllColumns \.stageColumnsGrid \.boardColumn[\s\S]*min-height:\s*38rem/
  );
  assert.match(
    css,
    /\.boardShellAllColumns \.boardColumn \.columnBody,[\s\S]*overflow:\s*visible/
  );
  assert.match(css, /\.stageColumnsGrid\s*\{[\s\S]*min-height:\s*100%/);
});
