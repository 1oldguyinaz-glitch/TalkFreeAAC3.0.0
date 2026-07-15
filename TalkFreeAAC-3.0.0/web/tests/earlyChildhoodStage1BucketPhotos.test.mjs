import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

test('BoardColumn renders bucket photographs when imageSrc exists', () => {
  const source = readFileSync(
    join(repoRoot, 'src/board/BoardColumn.jsx'),
    'utf8'
  );

  assert.match(source, /bucketButtonPhotoTile/);
  assert.match(source, /className="bucketPhotoTile"/);
  assert.match(source, /src=\{bucket\.imageSrc\}/);
  assert.match(source, /aria-label=\{bucket\.label\}/);
});
