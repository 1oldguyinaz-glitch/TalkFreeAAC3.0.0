import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from '../src/data/earlyChildhoodStage1Catalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

test('all 131 Stage 1 photos use the short extraction-safe path', () => {
  const words = Object.values(EARLY_CHILDHOOD_STAGE_1_CATALOG)
    .flatMap((column) => column.buckets)
    .flatMap((bucket) => bucket.words);

  assert.equal(words.length, 131);

  for (const word of words) {
    assert.match(word.imageSrc, /^\/p\/e1\//);
    assert.doesNotMatch(
      word.imageSrc,
      /assets\/emerging-talkers\/early-childhood\/stage-1/
    );
    assert.equal(
      existsSync(join(repoRoot, 'public', word.imageSrc.replace(/^\//, ''))),
      true,
      word.imageSrc
    );
  }
});
