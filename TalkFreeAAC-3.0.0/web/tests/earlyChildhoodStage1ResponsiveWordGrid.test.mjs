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

test('fitted word grid always creates enough visible cells', () => {
  for (const slotCount of [4, 7, 8, 12, 13, 16]) {
    for (const [width, height] of [
      [360, 320],
      [768, 420],
      [1280, 500]
    ]) {
      const grid = calculateFittedGrid(slotCount, width, height);
      assert.ok(grid.columns * grid.rows >= slotCount);
      assert.ok(grid.columns >= 1);
      assert.ok(grid.rows >= 1);
      assert.ok(grid.columns <= 8);
    }
  }
});

test('wide word areas use fewer rows so lower words stay visible', () => {
  const sevenWordCapacity = calculateFittedGrid(8, 1280, 420);
  const thirteenWordCapacity = calculateFittedGrid(16, 1280, 420);

  assert.ok(sevenWordCapacity.rows <= 2);
  assert.ok(thirteenWordCapacity.rows <= 2);
});

test('narrow word areas still include every fixed slot', () => {
  const grid = calculateFittedGrid(16, 360, 420);

  assert.ok(grid.columns * grid.rows >= 16);
  assert.ok(grid.rows <= 8);
});

test('single-column words enable measured fit-to-container behavior', () => {
  const column = source('src/board/BoardColumn.jsx');
  const fixedGrid = source('src/board/FixedSlotGrid.jsx');
  const css = source('src/board/board.css');

  assert.match(column, /fitToContainer/);
  assert.match(fixedGrid, /ResizeObserver/);
  assert.match(fixedGrid, /calculateFittedGrid/);
  assert.match(fixedGrid, /fixedSlotGridFitted/);
  assert.match(css, /repeat\(var\(--fit-columns\)/);
  assert.match(css, /repeat\(var\(--fit-rows\)/);
  assert.match(
    css,
    /\.boardColumnSingleWords \.columnBodyWords\s*\{[\s\S]*overflow:\s*hidden/
  );
  assert.match(
    css,
    /\.boardColumn \.fixedSlotGridFitted \.wordButton,[\s\S]*overflow:\s*hidden/
  );
});
