import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function source(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

test('single-column words mode has an explicit header, toolbar, and body grid', () => {
  const column = source('src/board/BoardColumn.jsx');
  const css = source('src/board/board.css');

  assert.match(
    column,
    /singleColumnMode && view\.mode === 'words' \? 'boardColumnSingleWords'/
  );
  assert.match(
    css,
    /\.boardColumnSingleWords\s*\{[\s\S]*grid-template-rows:\s*auto auto minmax\(0, 1fr\)/
  );
});

test('single-column slot count removes only trailing unused positions', () => {
  const column = source('src/board/BoardColumn.jsx');

  assert.match(column, /function fittedSingleColumnSlotCount/);
  assert.match(column, /highestAssignedSlot/);
  assert.match(column, /Math\.ceil\(Math\.max\(1, highestAssignedSlot\) \/ 4\) \* 4/);
  assert.match(
    column,
    /fittedSingleColumnSlotCount\([\s\S]*SINGLE_ACTIVE_COLUMN_WORD_SLOT_COUNT/
  );
});

test('fixed slot grid exposes slot count for responsive row sizing', () => {
  const grid = source('src/board/FixedSlotGrid.jsx');
  const css = source('src/board/board.css');

  assert.match(grid, /data-slot-count=\{slotCount\}/);
  for (const count of [4, 8, 12, 16]) {
    assert.match(
      css,
      new RegExp(`data-slot-count="${count}"`)
    );
  }
});

test('word tiles are allowed to shrink inside the available viewport', () => {
  const css = source('src/board/board.css');

  assert.match(
    css,
    /\.boardColumnSingle \.wordPhotoTile\s*\{[\s\S]*min-height:\s*0/
  );
});
