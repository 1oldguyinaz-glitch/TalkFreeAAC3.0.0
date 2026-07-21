import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGE_DEFINITIONS } from '../src/board/constants.js';
import { itemIsCongruent } from '../src/board/congruence.js';
import { loadCompiledCatalog } from './helpers/loadCompiledCatalog.mjs';

const AGES = ['early_childhood', 'school_age', 'teen', 'adult'];
const words = (catalog) =>
  Object.values(catalog).flatMap((column) =>
    column.buckets.flatMap((bucket) => bucket.words)
  );

test('every word has a complete age-policy map', async () => {
  const { catalog } = await loadCompiledCatalog();

  for (const word of words(catalog)) {
    assert.deepEqual(
      Object.keys(word.minimumStageByAgeBand).sort(),
      [...AGES].sort(),
      word.id
    );

    assert.ok(
      word.minimumStageByAgeBand.early_childhood == null
      || (
        word.minimumStageByAgeBand.early_childhood >= 1
        && word.minimumStageByAgeBand.early_childhood <= 4
      ),
      word.id
    );

    for (const age of ['school_age', 'teen', 'adult']) {
      assert.ok(
        word.minimumStageByAgeBand[age] >= 1
        && word.minimumStageByAgeBand[age] <= 4,
        word.id
      );
    }
  }
});

test('vocabulary does not decrease through the stages for any age band', async () => {
  const { manifest } = await loadCompiledCatalog();

  for (const age of AGES) {
    let previous = 0;
    for (let stage = 1; stage <= 4; stage += 1) {
      const current =
        manifest.displayWordCountsByAgeStage[age][String(stage)];
      assert.ok(current >= previous, `${age} Stage ${stage}`);
      previous = current;
    }
  }
});

test('Emerging Talker never receives a complex question', async () => {
  const { catalog } = await loadCompiledCatalog();
  const simple = new Set([
    'what', 'where', 'who', 'is', 'are', 'can', 'do', 'does', 'did', 'will'
  ]);
  const frames = new Set([
    'can you ___?', 'what is ___?', 'who is ___?', 'where is ___?'
  ]);

  for (const age of AGES) {
    for (const word of words(catalog)) {
      if (
        word.role !== 'question'
        || word.minimumStageByAgeBand[age] !== 1
      ) {
        continue;
      }

      const label = word.label.toLowerCase().trim();
      const parts = label.match(/[a-z0-9']+/g) ?? [];

      assert.ok(
        frames.has(label)
        || simple.has(label)
        || (parts.length <= 2 && simple.has(parts[0])),
        `${age}: ${word.label}`
      );
    }
  }
});

test('Adult Advanced Communicator can reach the complete bucketed catalog', async () => {
  const { catalog } = await loadCompiledCatalog();

  for (const word of words(catalog)) {
    assert.equal(
      itemIsCongruent(word, {
        stage: 4,
        ageBand: 'adult',
        previousToken: null,
        pendingVerb: null,
        sentence: [],
        contentSettings: {
          showSchool: true,
          showPrivateParts: true
        }
      }),
      true,
      word.id
    );
  }
});

function normalizedCatalogLabel(label) {
  return String(label)
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/u, '');
}

test('compiled catalog never repeats a normalized label across buckets', async () => {
  const { catalog } = await loadCompiledCatalog();
  const seen = new Map();

  for (const column of Object.values(catalog)) {
    for (const bucket of column.buckets) {
      for (const word of bucket.words) {
        const normalized = normalizedCatalogLabel(word.label);
        assert.equal(
          seen.has(normalized),
          false,
          `${word.label}: ${seen.get(normalized) ?? 'first occurrence'} and ${word.id}`
        );
        seen.set(normalized, word.id);
      }
    }
  }
});

test('stage names and paths match the final board contract', () => {
  assert.equal(STAGE_DEFINITIONS[1].label, 'Emerging Talker');
  assert.deepEqual(STAGE_DEFINITIONS[1].path, [1, 2, 6]);
  assert.equal(STAGE_DEFINITIONS[2].label, 'Expanding Talker');
  assert.deepEqual(STAGE_DEFINITIONS[2].path, [1, 2, 5, 6]);
  assert.equal(STAGE_DEFINITIONS[3].label, 'Sentence Builder');
  assert.deepEqual(STAGE_DEFINITIONS[3].path, [1, 2, 4, 5, 6]);
  assert.equal(STAGE_DEFINITIONS[4].label, 'Advanced Communicator');
  assert.deepEqual(STAGE_DEFINITIONS[4].path, [1, 2, 3, 4, 5, 6]);
});
