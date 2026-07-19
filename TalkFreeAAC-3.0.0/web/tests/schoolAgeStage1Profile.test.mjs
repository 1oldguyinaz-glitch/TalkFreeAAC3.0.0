import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHOOL_AGE_STAGE_1_CATALOG as C } from '../src/data/schoolAgeStage1Catalog.js';

const roots = (column) => C[column].buckets.filter((bucket) => !bucket.parentBucketId);
const directWords = (column) => C[column].buckets
  .flatMap((bucket) => bucket.words)
  .filter((word) => !word.targetBucketId);
const labels = (column) => new Set(directWords(column).map((word) => word.label));

test('School Age Stage 1 keeps the locked 1 to 2 to 6 language structure', () => {
  assert.equal(roots(1).length, 5);
  assert.equal(roots(2).length, 8);
  assert.equal(roots(6).length, 12);
  for (const column of [3, 4, 5]) assert.equal(C[column].buckets.length, 0);
});

test('Column 1 uses the approved buckets and direct Questions list', () => {
  assert.deepEqual(
    roots(1).map((bucket) => bucket.label),
    ['Who', 'Belongs To', 'People', 'Phrases', 'Questions']
  );
  const questions = C[1].buckets.find((bucket) => bucket.label === 'Questions');
  assert.deepEqual(
    questions.words.map((word) => word.label),
    ['Who', 'What', 'When', 'Where', 'Why', 'How', 'Can', 'Will', 'Do', 'Did']
  );
  assert.equal(questions.words.some((word) => word.targetBucketId), false);
});

test('Column 2 contains approved direct Stage 1 actions and excludes Stage 2 grammar', () => {
  assert.deepEqual(
    roots(2).map((bucket) => bucket.label),
    ['Feelings', 'Moving', 'Actions', 'Talking', 'Learning', 'Doing', 'Needs', 'Support']
  );
  const columnLabels = labels(2);
  for (const required of ['found', 'showed', 'helped', 'pushed', 'called', 'told', 'gave', 'took', 'saw']) {
    assert.equal(columnLabels.has(required), true, required);
  }
  for (const gated of ['want to', 'need to', 'like to', "don't", "can't"]) {
    assert.equal(columnLabels.has(gated), false, gated);
  }
});

test('Column 6 uses the approved reusable taxonomy and hides Safety from visible roots', () => {
  assert.deepEqual(
    roots(6).map((bucket) => bucket.label),
    [
      'Food and Drink', 'People', 'Feelings', 'Play', 'Places', 'Care',
      'Body Parts', 'Things', 'School', 'Clothes', 'Technology', 'Control'
    ]
  );
  const safety = C[6].buckets.find((bucket) => bucket.label === 'Safety');
  assert.ok(safety);
  assert.equal(safety.parentBucketId, '__quick_access__');
  assert.deepEqual(
    safety.words.map((word) => word.label),
    ['safe', 'danger', 'emergency', 'lost', 'fire', 'smoke', 'allergy', 'choking', 'bleeding', 'breathing trouble', '911', 'safe adult']
  );
});

test('all direct Column 6 selections finish the Stage 1 path', () => {
  for (const word of directWords(6)) {
    assert.equal(word.slamShutTrigger, true, `${word.label} should finish the path`);
  }
});

test('approved vocabulary inventory is stable', () => {
  assert.equal(directWords(1).length, 77);
  assert.equal(directWords(2).length, 71);
  assert.equal(directWords(6).length, 441);
  assert.equal(directWords(1).length + directWords(2).length + directWords(6).length, 589);
});
