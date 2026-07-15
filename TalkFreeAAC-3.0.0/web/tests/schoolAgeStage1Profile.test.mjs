import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHOOL_AGE_STAGE_1_CATALOG } from '../src/data/schoolAgeStage1Catalog.js';
import { getBucketPage, getWordPage } from '../src/board/catalogSelectors.js';

function words(column) {
  return SCHOOL_AGE_STAGE_1_CATALOG[column].buckets.flatMap((bucket) => bucket.words);
}

function context(column) {
  return {
    stage: 1,
    ageBand: 'school_age',
    previousToken: column === 1 ? null : { column: column === 2 ? 1 : 2 },
    pendingVerb: null,
    sentence: []
  };
}

test('School Age Stage 1 uses only Columns 1, 2, and 6', () => {
  assert.equal(SCHOOL_AGE_STAGE_1_CATALOG[1].buckets.length, 8);
  assert.equal(SCHOOL_AGE_STAGE_1_CATALOG[2].buckets.length, 8);
  assert.equal(SCHOOL_AGE_STAGE_1_CATALOG[3].buckets.length, 0);
  assert.equal(SCHOOL_AGE_STAGE_1_CATALOG[4].buckets.length, 0);
  assert.equal(SCHOOL_AGE_STAGE_1_CATALOG[5].buckets.length, 0);
  assert.equal(SCHOOL_AGE_STAGE_1_CATALOG[6].buckets.length, 8);
});

test('School Age Stage 1 contains the approved 276 entries', () => {
  assert.equal(words(1).length, 58);
  assert.equal(words(2).length, 90);
  assert.equal(words(6).length, 128);
  assert.equal(words(1).length + words(2).length + words(6).length, 276);
});

test('all School Age Stage 1 buckets and words fit the fixed no-scroll layout', () => {
  for (const column of [1, 2, 6]) {
    const buckets = getBucketPage(SCHOOL_AGE_STAGE_1_CATALOG, column, 1, context(column));
    assert.deepEqual(buckets.pages, [1]);
    assert.ok(buckets.items.length <= 8);
    for (const bucket of buckets.items) {
      const page = getWordPage(SCHOOL_AGE_STAGE_1_CATALOG, column, bucket.id, 1, context(column));
      assert.deepEqual(page.pages, [1], bucket.id);
      assert.ok(page.items.length <= 16, bucket.id);
    }
  }
});

test('Column 1 uses short frames and excludes complete question sentences', () => {
  const labels = new Set(words(1).map((item) => item.label));
  for (const label of [
    'Can I', 'Can you', 'What can I', 'How can I', 'Where can I',
    'Why did you', 'Why did I', 'What is', 'Where is', 'Which', 'Whose'
  ]) assert.equal(labels.has(label), true, label);

  for (const label of [
    'What happened?', 'Are you okay?', 'Can you help?', 'Can I go?',
    'Can I stop?', 'Is it safe?', 'What do you mean?', 'Where are we going?'
  ]) assert.equal(labels.has(label), false, label);
});

test('Column 2 contains the corrected action units and excludes raw catalog errors', () => {
  const labels = new Set(words(2).map((item) => item.label));
  for (const label of ["can't", "don't", 'look at', 'listen to', 'turn on', 'turn off']) {
    assert.equal(labels.has(label), true, label);
  }
  for (const label of ['look', 'listen', 'tap', 'scroll', 'dragon', 'goat', 'sweater']) {
    assert.equal(labels.has(label), false, label);
  }
});

test('Column 6 includes targets required by school, technology, health, and people routes', () => {
  const labels = new Set(words(6).map((item) => item.label));
  for (const label of [
    'question', 'word', 'number', 'math', 'reading', 'spelling', 'message',
    'file', 'photo', 'pain', 'headache', 'stomachache', 'toothache',
    'principal', 'therapist', 'coach', 'doctor', 'nurse'
  ]) assert.equal(labels.has(label), true, label);
});

test('all targets finish the Stage 1 path and return to Start', () => {
  for (const target of words(6)) assert.equal(target.slamShutTrigger, true, target.label);
});
