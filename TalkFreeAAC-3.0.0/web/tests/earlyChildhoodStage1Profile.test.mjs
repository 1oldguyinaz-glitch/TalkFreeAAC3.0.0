import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from '../src/data/earlyChildhoodStage1Catalog.js';
import { getBucketPage, getWordPage } from '../src/board/catalogSelectors.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function context(column) {
  const previousColumn = column === 1 ? 0 : (column === 2 ? 1 : 2);
  return {
    stage: 1,
    ageBand: 'early_childhood',
    previousToken: previousColumn ? { column: previousColumn } : null,
    pendingVerb: null,
    sentence: []
  };
}

function allWords() {
  return Object.values(EARLY_CHILDHOOD_STAGE_1_CATALOG)
    .flatMap((column) => column.buckets)
    .flatMap((bucket) => bucket.words);
}

function allBuckets() {
  return Object.values(EARLY_CHILDHOOD_STAGE_1_CATALOG)
    .flatMap((column) => column.buckets);
}

test('approved Stage 1 profile uses only Columns 1, 2, and 6', () => {
  assert.equal(EARLY_CHILDHOOD_STAGE_1_CATALOG[1].buckets.length, 5);
  assert.equal(EARLY_CHILDHOOD_STAGE_1_CATALOG[2].buckets.length, 4);
  assert.equal(EARLY_CHILDHOOD_STAGE_1_CATALOG[3].buckets.length, 0);
  assert.equal(EARLY_CHILDHOOD_STAGE_1_CATALOG[4].buckets.length, 0);
  assert.equal(EARLY_CHILDHOOD_STAGE_1_CATALOG[5].buckets.length, 0);
  assert.equal(EARLY_CHILDHOOD_STAGE_1_CATALOG[6].buckets.length, 8);
});

test('approved profile contains exactly 131 words', () => {
  assert.equal(allWords().length, 131);
  assert.equal(
    EARLY_CHILDHOOD_STAGE_1_CATALOG[1].buckets
      .flatMap((bucket) => bucket.words).length,
    28
  );
  assert.equal(
    EARLY_CHILDHOOD_STAGE_1_CATALOG[2].buckets
      .flatMap((bucket) => bucket.words).length,
    28
  );
  assert.equal(
    EARLY_CHILDHOOD_STAGE_1_CATALOG[6].buckets
      .flatMap((bucket) => bucket.words).length,
    75
  );
});

test('all root buckets and word sets fit on one page', () => {
  for (const column of [1, 2, 6]) {
    const bucketPage = getBucketPage(
      EARLY_CHILDHOOD_STAGE_1_CATALOG,
      column,
      1,
      context(column)
    );
    assert.deepEqual(bucketPage.pages, [1]);
    assert.ok(bucketPage.items.length <= 8);
    for (const bucket of bucketPage.items) {
      const wordPage = getWordPage(
        EARLY_CHILDHOOD_STAGE_1_CATALOG,
        column,
        bucket.id,
        1,
        context(column)
      );
      assert.deepEqual(wordPage.pages, [1], bucket.id);
      assert.ok(wordPage.items.length <= 16, bucket.id);
    }
  }
});

test('every approved word has a real cropped photo tile on disk', () => {
  for (const word of allWords()) {
    assert.equal(word.visualStyle, 'approved_photo_tile');
    assert.ok(word.imageSrc?.startsWith('/p/e1/'), word.id);
    assert.equal(
      existsSync(join(repoRoot, 'public', word.imageSrc.replace(/^\//, ''))),
      true,
      word.imageSrc
    );
  }
});

test('every Stage 1 root bucket has a real photo tile on disk', () => {
  for (const bucket of allBuckets()) {
    assert.equal(bucket.visualStyle, 'approved_bucket_photo_tile');
    assert.ok(bucket.imageSrc?.startsWith('/p/e1/b/'), bucket.id);
    assert.equal(
      existsSync(join(repoRoot, 'public', bucket.imageSrc.replace(/^\//, ''))),
      true,
      bucket.imageSrc
    );
  }
});

test('Column 1 matches the approved starter vocabulary', () => {
  assert.deepEqual(
    EARLY_CHILDHOOD_STAGE_1_CATALOG[1].buckets.map(
      (bucket) => [bucket.label, bucket.words.map((word) => word.label)]
    ),
    [
      ['Core Words', ['I', 'you', 'we', 'he', 'she', 'it', 'they', 'my']],
      ['Family', ['mom', 'dad', 'brother', 'sister']],
      ['Social and Quick Messages', [
        'hi', 'bye', 'please', 'thank you', 'more', 'all done', 'again', 'wait'
      ]],
      ['Questions', ['what', 'where', 'who', 'when', 'why']],
      ['Social People', ['teacher', 'therapist', 'friend']]
    ]
  );
});

test('Column 2 matches the approved action vocabulary', () => {
  assert.deepEqual(
    EARLY_CHILDHOOD_STAGE_1_CATALOG[2].buckets.map(
      (bucket) => [bucket.label, bucket.words.map((word) => word.label)]
    ),
    [
      ['Core Actions', [
        'want', 'need', 'go', 'eat', 'drink', 'help', 'play', 'stop', 'open',
        'close', 'like', 'have', "don't"
      ]],
      ['Being and Connecting', ['am', 'is', 'love', 'loves']],
      ['Basic Movement', ['come', 'walk', 'run', 'sit']],
      ['Daily Needs', ['wash', 'wipe', 'sleep', 'give', 'brush', 'wear', 'read']]
    ]
  );
});

test('Column 6 matches the approved target vocabulary', () => {
  assert.deepEqual(
    EARLY_CHILDHOOD_STAGE_1_CATALOG[6].buckets.map(
      (bucket) => [bucket.label, bucket.words.map((word) => word.label)]
    ),
    [
      ['Food and Drink', [
        'water', 'milk', 'juice', 'snack', 'cereal', 'apple', 'banana',
        'orange', 'chicken nuggets', 'french fries', 'hamburger',
        'cheeseburger', 'pizza'
      ]],
      ['People and Object Pronouns', [
        'mom', 'dad', 'brother', 'sister', 'teacher', 'therapist', 'me',
        'you', 'him', 'her', 'them', 'it'
      ]],
      ['Feelings and Body States', [
        'happy', 'sad', 'mad', 'scared', 'tired', 'hurt', 'hungry', 'thirsty'
      ]],
      ['Safety and Comfort', [
        'help', 'lost', 'unsafe', 'hug', 'kiss', 'cuddle', 'blanket', 'quiet'
      ]],
      ['Toys and Play', [
        'ball', 'blocks', 'bubbles', 'doll', 'toy car', 'book', 'tablet', 'swing'
      ]],
      ['Places and Personal Care', [
        'bathroom', 'potty', 'bath', 'home', 'school', 'outside', 'toilet', 'shoes'
      ]],
      ['Body Parts', [
        'hands', 'feet', 'face', 'head', 'hair', 'mouth', 'teeth', 'nose',
        'eyes', 'ears', 'tummy', 'body'
      ]],
      ['Daily Objects', ['door', 'chair', 'bed', 'cup', 'soap', 'towel']]
    ]
  );
});

test('critical Stage 1 sentence vocabulary is available', () => {
  const labels = new Set(allWords().map((word) => word.label));
  for (const path of [
    ['I', 'want', 'water'],
    ['I', "don't", 'want', 'water'],
    ['my', 'hands'],
    ['I', 'wash', 'hands'],
    ['I', 'brush', 'teeth'],
    ['when', 'is', 'school'],
    ['why', 'is', 'it']
  ]) {
    for (const label of path) {
      assert.equal(labels.has(label), true, `${path.join(' → ')} missing ${label}`);
    }
  }
});

test('photo tiles preserve Fitzgerald shading and fit their complete cards', () => {
  const css = readFileSync(join(repoRoot, 'src/board/board.css'), 'utf8');
  const wordImageBlock =
    css.match(/\.wordPhotoTile\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const bucketImageBlock =
    css.match(/\.bucketPhotoTile\s*\{([\s\S]*?)\}/)?.[1] ?? '';

  assert.match(wordImageBlock, /object-fit\s*:\s*contain/i);
  assert.match(bucketImageBlock, /object-fit\s*:\s*contain/i);
  assert.match(bucketImageBlock, /width\s*:\s*100%/i);
  assert.match(bucketImageBlock, /height\s*:\s*100%/i);
});
