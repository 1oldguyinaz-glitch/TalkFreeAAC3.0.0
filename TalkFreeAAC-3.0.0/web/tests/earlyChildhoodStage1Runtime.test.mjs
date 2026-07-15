import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from '../src/data/earlyChildhoodStage1Catalog.js';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testDir, '..');

test('Board uses the Early Childhood Stage 1 photo catalog at runtime', () => {
  const boardSource = readFileSync(join(repoRoot, 'src/board/Board.jsx'), 'utf8');

  assert.match(
    boardSource,
    /import \{ EARLY_CHILDHOOD_STAGE_1_CATALOG \} from '\.\.\/data\/earlyChildhoodStage1Catalog\.js';/
  );
  assert.match(
    boardSource,
    /state\.ageBand === 'early_childhood' && state\.stage === 1/
  );
  assert.match(boardSource, /catalog=\{displayedCatalog\}/);
  assert.match(
    boardSource,
    /firstVisibleWordPage\(bucket\.words \?\? \[\], context\)/
  );
});

test('all 131 Stage 1 words point to existing public photo files', () => {
  const words = Object.values(EARLY_CHILDHOOD_STAGE_1_CATALOG)
    .flatMap((column) => column.buckets)
    .flatMap((bucket) => bucket.words);

  assert.equal(words.length, 131);

  for (const word of words) {
    assert.ok(word.imageSrc, `${word.id} is missing imageSrc`);
    assert.ok(
      existsSync(join(repoRoot, 'public', word.imageSrc.replace(/^\//, ''))),
      `${word.id} image was not found at public${word.imageSrc}`
    );
  }
});
