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
  assert.match(source, /Show all AXIS columns in this stage/);
  assert.match(source, /Show one active AXIS column/);
  assert.match(source, /All Columns/);
  assert.match(source, /One Column/);
});
