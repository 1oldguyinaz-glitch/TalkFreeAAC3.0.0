import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const source = (path) => readFileSync(join(root, path), 'utf8');

test('reference layout places the board before the bottom communication dock', () => {
  const board = source('src/board/Board.jsx');
  const viewportIndex = board.indexOf('className="boardViewport"');
  const dockIndex = board.indexOf('className="boardCommunicationDock boardUtilityRowStageOne"');

  assert.match(board, /boardShellReferenceTheme/);
  assert.match(board, /boardChromeHeader/);
  assert.match(board, /TalkFree/);
  assert.match(board, /Connection is the outcome\./);
  assert.ok(viewportIndex >= 0);
  assert.ok(dockIndex > viewportIndex);
  assert.match(board.slice(dockIndex), /<SentenceBar[\s\S]*<InterruptRow/);
});

test('reference theme includes the approved navy, lime, blue, green, orange, and purple palette', () => {
  const css = source('src/board/board.css');

  assert.match(css, /--reference-navy:\s*#061426/);
  assert.match(css, /--reference-lime:\s*#8bcd22/);
  assert.match(css, /--reference-blue:\s*#1267a9/);
  assert.match(css, /--reference-green:\s*#3f7f28/);
  assert.match(css, /--reference-orange:\s*#ad570c/);
  assert.match(css, /--reference-purple:\s*#60477d/);
  assert.match(css, /\.boardCommunicationDock/);
  assert.match(css, /\.boardShellReferenceTheme \.boardColumnActive[\s\S]*var\(--reference-lime\)/);
});

test('theme remains presentation-only and keeps AXIS routing outside the stylesheet', () => {
  const css = source('src/board/board.css');
  const board = source('src/board/Board.jsx');

  assert.doesNotMatch(css, /STAGE_PATHS|targetBucketId|minimumStageByAgeBand/);
  assert.match(board, /visibleColumnDefinitions/);
  assert.match(board, /singleColumnMode/);
  assert.match(board, /ColumnViewToggle/);
});
