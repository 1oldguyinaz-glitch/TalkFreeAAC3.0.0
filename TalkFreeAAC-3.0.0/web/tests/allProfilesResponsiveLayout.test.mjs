import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateFittedGrid } from '../src/board/gridFit.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function source(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

test('every age and stage uses the shared viewport-responsive board shell', () => {
  const board = source('src/board/Board.jsx');
  const css = source('src/board/board.css');

  assert.match(board, /'boardShellResponsive'/);
  assert.match(css, /\.boardShellResponsive\s*\{[\s\S]*height:\s*100dvh/);
  assert.match(css, /\.boardShellResponsive \.boardViewport\s*\{[\s\S]*flex:\s*1 1 auto/);
  assert.match(css, /\.boardShellResponsive \.sixColumnGrid \.boardColumn\s*\{[\s\S]*height:\s*100%/);
});

test('word, bucket, and grammar grids all opt into measured fitting', () => {
  const column = source('src/board/BoardColumn.jsx');
  const grammar = source('src/board/GrammarOverlay.jsx');
  const fixedGrid = source('src/board/FixedSlotGrid.jsx');
  const css = source('src/board/board.css');

  assert.equal((column.match(/fitToContainer/g) ?? []).length, 2);
  assert.match(grammar, /fitToContainer/);
  assert.match(fixedGrid, /fitToContainer = true/);
  assert.match(css, /\.boardColumn \.fixedSlotGridFitted/);
  assert.doesNotMatch(css, /\.boardColumnSingleWords \.fixedSlotGridFitted/);
});

test('shared fitted grids preserve every fixed motor-plan slot', () => {
  for (const slotCount of [4, 6, 8, 12, 16]) {
    for (const [width, height] of [
      [160, 360],
      [220, 520],
      [600, 420],
      [1200, 620]
    ]) {
      const grid = calculateFittedGrid(slotCount, width, height);
      assert.ok(grid.columns * grid.rows >= slotCount);
      assert.ok(grid.columns >= 1);
      assert.ok(grid.rows >= 1);
    }
  }
});
