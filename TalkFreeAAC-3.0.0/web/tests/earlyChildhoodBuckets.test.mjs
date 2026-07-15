import test from 'node:test';
import assert from 'node:assert/strict';
import { itemIsCongruent } from '../src/board/congruence.js';
import { loadCompiledCatalog } from './helpers/loadCompiledCatalog.mjs';

function context(stage) {
  return {
    stage,
    ageBand: 'early_childhood',
    previousToken: null,
    pendingVerb: null,
    sentence: []
  };
}

test('Early Childhood has exact progressive totals and a 305 ceiling', async () => {
  const { manifest } = await loadCompiledCatalog();
  assert.deepEqual(
    manifest.displayWordCountsByAgeStage.early_childhood,
    { '1': 185, '2': 235, '3': 275, '4': 305 }
  );
});

test('Early Childhood Column 1 never exposes more than five curated buckets', async () => {
  const { catalog } = await loadCompiledCatalog();
  const expected = new Set([
    'c1_core_words',
    'c1_questions_words',
    'c1_social_words',
    'c1_feelings_words',
    'c1_emergency_phrases'
  ]);

  for (let stage = 1; stage <= 4; stage += 1) {
    const visible = catalog[1].buckets.filter((bucket) =>
      itemIsCongruent(bucket, context(stage))
    );

    assert.ok(visible.length <= 5, `Stage ${stage}: ${visible.length}`);
    for (const bucket of visible) {
      assert.ok(expected.has(bucket.id), bucket.id);
    }
  }
});

test('every visible Early Childhood bucket contains a visible word', async () => {
  const { catalog } = await loadCompiledCatalog();

  for (let stage = 1; stage <= 4; stage += 1) {
    for (let column = 1; column <= 6; column += 1) {
      for (const bucket of catalog[column].buckets) {
        if (!itemIsCongruent(bucket, context(stage))) continue;

        const visibleWords = bucket.words.filter((word) =>
          itemIsCongruent(word, context(stage))
        );

        assert.ok(
          visibleWords.length > 0,
          `Stage ${stage}, Column ${column}, ${bucket.id}`
        );
      }
    }
  }
});

test('null Early Childhood policy values remain hidden even at Stage 4', () => {
  assert.equal(
    itemIsCongruent(
      {
        visibleByStage: [1, 2, 3, 4],
        minimumStageByAgeBand: {
          early_childhood: null,
          school_age: 1,
          teen: 1,
          adult: 1
        }
      },
      context(4)
    ),
    false
  );
});

test('Early Childhood Stage 1 questions remain simple', async () => {
  const { catalog } = await loadCompiledCatalog();
  const allowed = new Set([
    'are', 'can', 'does', 'is', 'what', 'where', 'who', 'will'
  ]);

  const visibleQuestions = catalog[1].buckets.flatMap((bucket) =>
    bucket.words.filter((word) =>
      word.role === 'question' && itemIsCongruent(word, context(1))
    )
  );

  for (const word of visibleQuestions) {
    assert.ok(allowed.has(word.label.toLowerCase()), word.label);
  }
});
