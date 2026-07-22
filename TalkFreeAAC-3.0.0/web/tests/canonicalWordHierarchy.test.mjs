import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBucketPage } from '../src/board/catalogSelectors.js';
import { itemIsCongruent } from '../src/board/congruence.js';
import { STAGE_PATHS } from '../src/board/constants.js';
import { requiredRootLabels } from '../src/data/bucketLabelContract.js';
import { buildCanonicalWordHierarchy } from '../src/data/canonicalWordHierarchy.js';
import { CANONICAL_BUCKET_GROUPS } from '../src/data/catalogHierarchy.js';
import { SCHOOL_AGE_STAGE_1_CATALOG } from '../src/data/schoolAgeStage1Catalog.js';
import { TEEN_STAGE_1_CATALOG } from '../src/data/teenStage1Catalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, '..');

function keyFor(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function loadPayload(column, kind) {
  return JSON.parse(readFileSync(
    join(webRoot, 'public', 'catalog', 'columns', `column${column}.${kind}.json`),
    'utf8'
  ));
}

const SOURCE_PAYLOADS = Object.fromEntries(
  [1, 2, 3, 4, 5, 6].map((column) => [column, loadPayload(column, 'words')])
);

const COMPILED = Object.fromEntries(
  [1, 2, 3, 4, 5, 6].map((column) => [
    column,
    buildCanonicalWordHierarchy(
      loadPayload(column, 'directory'),
      SOURCE_PAYLOADS[column]
    )
  ])
);

function terminalRecords(catalog) {
  const byId = new Map(catalog.buckets.map((bucket) => [bucket.id, bucket]));
  const pathCache = new Map();

  function pathFor(bucket) {
    if (pathCache.has(bucket.id)) return pathCache.get(bucket.id);
    const parent = bucket.parentBucketId && byId.get(bucket.parentBucketId);
    const path = parent ? [...pathFor(parent), bucket.label] : [bucket.label];
    pathCache.set(bucket.id, path);
    return path;
  }

  return catalog.buckets.flatMap((bucket) =>
    (bucket.words ?? [])
      .filter((word) => !word.targetBucketId)
      .map((word) => ({ word, bucket, path: pathFor(bucket) }))
  );
}

function referenceRoots(catalog, column) {
  const rootsByLabel = new Map();
  const approvedRoots = new Set(
    CANONICAL_BUCKET_GROUPS[column].map((group) => group.label)
  );
  for (const { word, path } of terminalRecords(catalog[column])) {
    if (!approvedRoots.has(path[0])) continue;
    const key = keyFor(word.label);
    if (!rootsByLabel.has(key)) rootsByLabel.set(key, new Set());
    rootsByLabel.get(key).add(path[0]);
  }
  return rootsByLabel;
}

function contextFor(ageBand, stage, column) {
  const path = STAGE_PATHS[stage];
  const index = path.indexOf(column);
  const previousColumn = index > 0 ? path[index - 1] : 0;
  return {
    stage,
    ageBand,
    previousToken: previousColumn
      ? { column: previousColumn, role: 'axis_previous' }
      : null,
    pendingVerb: null,
    sentence: [],
    contentSettings: { showSchool: true, showPrivateParts: true }
  };
}

function visibleTerminalRecords(catalog, column, context) {
  const byId = new Map(catalog.buckets.map((bucket) => [bucket.id, bucket]));
  const roots = getBucketPage({ [column]: catalog }, column, 1, context).items;
  const pending = [...roots];
  const visited = new Set();
  const terminal = [];

  while (pending.length) {
    const bucket = pending.pop();
    if (!bucket || visited.has(bucket.id)) continue;
    visited.add(bucket.id);
    for (const word of bucket.words ?? []) {
      if (!itemIsCongruent(word, context)) continue;
      if (word.targetBucketId) pending.push(byId.get(word.targetBucketId));
      else terminal.push(word);
    }
  }
  return terminal;
}

test('every source word is represented once and every user-facing label has one address', () => {
  let sourceTotal = 0;

  for (let column = 1; column <= 6; column += 1) {
    const sourceWords = Object.values(SOURCE_PAYLOADS[column].buckets).flat();
    const sourceIds = new Set(sourceWords.map((word) => word.id));
    const terminal = terminalRecords(COMPILED[column]).map(({ word }) => word);
    const represented = new Map();

    for (const word of terminal.filter((candidate) => !candidate.canonicalAnchor)) {
      for (const sourceId of word.sourceIds ?? [word.id]) {
        represented.set(sourceId, (represented.get(sourceId) ?? 0) + 1);
      }
    }

    assert.equal(COMPILED[column].metadata.sourceWordCount, sourceWords.length);
    assert.equal(COMPILED[column].metadata.canonicalWordCount, terminal.length);
    assert.equal(new Set(terminal.map((word) => word.id)).size, terminal.length);
    assert.equal(
      new Set(terminal.map((word) => keyFor(word.label))).size,
      terminal.length,
      `Column ${column} repeats a displayed label`
    );
    assert.deepEqual(new Set(represented.keys()), sourceIds);
    assert.equal(
      [...represented.values()].every((count) => count === 1),
      true,
      `Column ${column} repeats a source entry`
    );
    sourceTotal += sourceWords.length;
  }

  assert.equal(sourceTotal, 9995);
});

test('canonical bucket navigation is complete, reachable, and limited to one screen', () => {
  for (let column = 1; column <= 6; column += 1) {
    const catalog = COMPILED[column];
    const byId = new Map(catalog.buckets.map((bucket) => [bucket.id, bucket]));
    const roots = catalog.buckets.filter((bucket) => !bucket.parentBucketId);
    const pending = roots.map((bucket) => bucket.id);
    const reachable = new Set();

    assert.equal(byId.size, catalog.buckets.length, `Column ${column} bucket IDs`);
    assert.deepEqual(
      roots.map((bucket) => bucket.label),
      CANONICAL_BUCKET_GROUPS[column].map((group) => group.label)
    );
    assert.equal(roots.some((bucket) => bucket.label === 'More'), false);

    while (pending.length) {
      const bucketId = pending.pop();
      if (reachable.has(bucketId)) continue;
      reachable.add(bucketId);
      const bucket = byId.get(bucketId);
      const navigation = (bucket.words ?? []).filter((word) => word.targetBucketId);
      const terminal = (bucket.words ?? []).filter((word) => !word.targetBucketId);

      assert.equal(navigation.length && terminal.length, 0, `${bucket.label} mixes levels`);
      assert.ok(navigation.length <= 16, `${bucket.label} has ${navigation.length} folders`);
      assert.deepEqual(navigation.map((word) => word.page), navigation.map(() => 1));
      assert.deepEqual(
        navigation.map((word) => word.slot),
        navigation.map((_, index) => index + 1)
      );

      for (const word of navigation) {
        const target = byId.get(word.targetBucketId);
        assert.ok(target, `${word.label} has a missing target`);
        assert.equal(target.parentBucketId, bucket.id);
        pending.push(target.id);
      }

      const positions = terminal.map((word) => `${word.page}:${word.slot}`);
      assert.equal(new Set(positions).size, positions.length, `${bucket.label} word slots`);
      assert.equal(
        terminal.every((word) => word.slot >= 1 && word.slot <= 16),
        true,
        `${bucket.label} word capacity`
      );
    }

    assert.equal(reachable.size, catalog.buckets.length, `Column ${column} reachability`);
  }
});

test('School and Teen Stage 1 words retain an approved root address upward', () => {
  const schoolRoots = Object.fromEntries(
    [1, 2, 6].map((column) => [column, referenceRoots(SCHOOL_AGE_STAGE_1_CATALOG, column)])
  );
  const teenRoots = Object.fromEntries(
    [1, 2, 6].map((column) => [column, referenceRoots(TEEN_STAGE_1_CATALOG, column)])
  );

  for (const column of [1, 2, 6]) {
    const compiledByLabel = new Map(
      terminalRecords(COMPILED[column]).map((record) => [keyFor(record.word.label), record])
    );

    for (const [key, allowedRoots] of teenRoots[column]) {
      const compiled = compiledByLabel.get(key);
      assert.ok(compiled, `Teen C${column} missing ${key}`);
      assert.equal(allowedRoots.has(compiled.path[0]), true, `Teen C${column} moved ${key}`);
    }
    for (const [key, allowedRoots] of schoolRoots[column]) {
      const compiled = compiledByLabel.get(key);
      assert.ok(compiled, `School C${column} missing ${key}`);
      assert.equal(allowedRoots.has(compiled.path[0]), true, `School C${column} moved ${key}`);
    }

    const teenVisible = new Set(
      visibleTerminalRecords(COMPILED[column], column, contextFor('teen', 2, column))
        .map((word) => keyFor(word.label))
    );
    const adultVisible = new Set(
      visibleTerminalRecords(COMPILED[column], column, contextFor('adult', 1, column))
        .map((word) => keyFor(word.label))
    );
    const schoolVisible = new Set(
      visibleTerminalRecords(COMPILED[column], column, contextFor('school_age', 2, column))
        .map((word) => keyFor(word.label))
    );

    for (const key of teenRoots[column].keys()) {
      assert.equal(teenVisible.has(key), true, `Teen Stage 2 C${column} hides ${key}`);
      assert.equal(adultVisible.has(key), true, `Adult Stage 1 C${column} hides ${key}`);
    }
    for (const key of schoolRoots[column].keys()) {
      assert.equal(schoolVisible.has(key), true, `School Stage 2 C${column} hides ${key}`);
    }
  }
});

test('every visible older-age root leads to words throughout each AXIS stage path', () => {
  for (const ageBand of ['school_age', 'teen', 'adult']) {
    const firstCompiledStage = ageBand === 'adult' ? 1 : 2;
    for (let stage = firstCompiledStage; stage <= 4; stage += 1) {
      for (const column of STAGE_PATHS[stage]) {
        const context = contextFor(ageBand, stage, column);
        const roots = getBucketPage(
          { [column]: COMPILED[column] },
          column,
          1,
          context
        ).items;
        const rootLabels = roots.map((root) => root.label);
        const visibleLabels = new Set(
          visibleTerminalRecords(COMPILED[column], column, context)
            .map((word) => keyFor(word.label))
        );

        for (const required of requiredRootLabels(ageBand, column)) {
          assert.equal(
            rootLabels.includes(required),
            true,
            `${ageBand} Stage ${stage} C${column} missing ${required}`
          );
        }

        for (const root of roots) {
          const rootTerminalKeys = new Set(
            terminalRecords(COMPILED[column])
              .filter((record) => record.path[0] === root.label)
              .map((record) => keyFor(record.word.label))
          );
          assert.equal(
            [...rootTerminalKeys].some((key) => visibleLabels.has(key)),
            true,
            `${ageBand} Stage ${stage} C${column} empty ${root.label}`
          );
        }
      }
    }
  }
});
