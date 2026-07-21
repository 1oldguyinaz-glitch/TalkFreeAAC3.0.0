import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  readdirSync,
  statSync
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from '../src/data/earlyChildhoodStage1Catalog.js';
import { SCHOOL_AGE_STAGE_1_CATALOG } from '../src/data/schoolAgeStage1Catalog.js';
import { TEEN_STAGE_1_CATALOG } from '../src/data/teenStage1Catalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, '..');
const projectRoot = join(webRoot, '..');
const publicRoot = join(webRoot, 'public');

const catalogs = {
  early_childhood: EARLY_CHILDHOOD_STAGE_1_CATALOG,
  school_age: SCHOOL_AGE_STAGE_1_CATALOG,
  teen: TEEN_STAGE_1_CATALOG
};

function items(catalog) {
  return Object.values(catalog).flatMap((column) =>
    column.buckets.flatMap((bucket) => [bucket, ...bucket.words])
  );
}

function filesBelow(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

test('approved dedicated profiles have unique IDs and real short-path images', () => {
  for (const [ageBand, catalog] of Object.entries(catalogs)) {
    const profileItems = items(catalog);
    const ids = profileItems.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length, `${ageBand} duplicate ID`);

    for (const item of profileItems.filter((entry) => entry.imageSrc)) {
      assert.ok(item.imageSrc.startsWith('/p/'), `${item.id}: ${item.imageSrc}`);
      assert.ok(item.imageSrc.length <= 64, `${item.id}: ${item.imageSrc}`);
      assert.equal(
        existsSync(join(publicRoot, item.imageSrc.replace(/^\//, ''))),
        true,
        `${item.id}: ${item.imageSrc}`
      );
    }
  }
});

test('dedicated profiles never repeat a label inside the same bucket', () => {
  for (const [ageBand, catalog] of Object.entries(catalogs)) {
    for (const column of Object.values(catalog)) {
      for (const bucket of column.buckets) {
        const labels = (bucket.words ?? []).map((word) =>
          String(word.label).toLowerCase().trim()
        );
        assert.equal(
          new Set(labels).size,
          labels.length,
          `${ageBand}: ${bucket.label}`
        );
      }
    }
  }
});

test('dedicated profile routes and fixed coordinates are complete', () => {
  for (const [ageBand, catalog] of Object.entries(catalogs)) {
    for (const column of Object.values(catalog)) {
      const bucketIds = new Set(column.buckets.map((bucket) => bucket.id));
      const rootCoordinates = new Set();

      for (const bucket of column.buckets) {
        if (!bucket.parentBucketId) {
          const coordinate = `${bucket.page ?? 1}:${bucket.slot}`;
          assert.equal(rootCoordinates.has(coordinate), false, coordinate);
          assert.ok(bucket.slot >= 1 && bucket.slot <= 8, bucket.id);
          rootCoordinates.add(coordinate);
        }

        const wordCoordinates = new Set();
        for (const word of bucket.words ?? []) {
          const coordinate = `${word.page ?? 1}:${word.slot}`;
          assert.equal(
            wordCoordinates.has(coordinate),
            false,
            `${ageBand}: ${bucket.id}: ${coordinate}`
          );
          assert.ok(word.slot >= 1 && word.slot <= 16, word.id);
          wordCoordinates.add(coordinate);

          if (word.targetBucketId) {
            assert.equal(
              bucketIds.has(word.targetBucketId),
              true,
              `${ageBand}: ${word.id}`
            );
          }
        }
      }
    }
  }
});

test('every public repository path remains extraction-safe', () => {
  for (const path of filesBelow(publicRoot)) {
    const repositoryPath = relative(publicRoot, path);
    assert.ok(repositoryPath.length <= 64, repositoryPath);
  }
});

test('the application has one canonical web source tree', () => {
  for (const accidentalRoot of ['public', 'src', 'tests']) {
    assert.equal(existsSync(join(projectRoot, accidentalRoot)), false);
  }
});
