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

test('all permanent board controls use the shared large-type label', () => {
  for (const relativePath of [
    'src/board/InterruptRow.jsx',
    'src/board/SentenceBar.jsx',
    'src/board/BoardSettings.jsx',
    'src/board/Pagination.jsx'
  ]) {
    assert.match(source(relativePath), /controlButtonLabel/);
  }
});

test('all text vocabulary and grammar buttons use the shared board label', () => {
  assert.match(source('src/board/BoardColumn.jsx'), /boardButtonLabel/);
  assert.match(source('src/board/GrammarOverlay.jsx'), /boardButtonLabel/);
});

test('button lettering scales from each rendered button box', () => {
  const css = source('src/board/board.css');

  assert.match(css, /TalkFreeAAC 3\.1\.0 — global large-type button system/);
  assert.match(css, /container-type:\s*size/);
  assert.match(css, /\.controlButtonLabel[\s\S]*font-size:\s*clamp\([^;]*cqw[^;]*cqh/);
  assert.match(css, /\.boardButtonLabel[\s\S]*font-size:\s*clamp\([^;]*cqw[^;]*cqh/);
  assert.match(css, /\.photoTileLabel[\s\S]*font-size:\s*clamp\([^;]*cqw[^;]*cqh/);
});
