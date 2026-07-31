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
  assert.match(css, /--all-column-min-width:\s*clamp\(10rem/);
  assert.match(css, /grid-template-columns:\s*repeat\([\s\S]*var\(--visible-columns\)/);
  assert.match(css, /\.boardShellAllColumns \.boardColumn \.bucketButton,[\s\S]*min-width:\s*0/);
  assert.match(css, /\.boardShellAllColumns \.boardColumn \.wordButton[\s\S]*min-height:\s*0/);
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

test('all-columns labels wrap at word boundaries as cards resize', () => {
  const css = readFileSync(join(root, 'src', 'board', 'board.css'), 'utf8');

  assert.match(
    css,
    /\.boardShellAllColumns \.boardButtonLabel,[\s\S]*overflow-wrap:\s*break-word/
  );
  assert.match(css, /word-break:\s*normal/);
  assert.match(css, /hyphens:\s*none/);
  assert.match(css, /text-wrap:\s*balance/);
});

test('all-columns mode fits fixed slots into the available board height', () => {
  const grid = readFileSync(join(root, 'src', 'board', 'FixedSlotGrid.jsx'), 'utf8');
  const css = readFileSync(join(root, 'src', 'board', 'board.css'), 'utf8');

  assert.match(grid, /const slotRows = Math\.max\(1, Math\.ceil\(/);
  assert.match(grid, /data-slot-rows=\{slotRows\}/);
  assert.match(
    css,
    /\.boardShellAllColumns \.boardViewport[\s\S]*overflow-y:\s*hidden/
  );
  assert.match(
    css,
    /\.boardShellAllColumns \.boardColumn \.fixedSlotGrid[\s\S]*grid-template-rows:\s*repeat\(var\(--slot-rows, 6\)/
  );
  assert.match(
    css,
    /\.boardShellAllColumns \.stageColumnsGrid[\s\S]*height:\s*100%[\s\S]*min-height:\s*0/
  );
});
