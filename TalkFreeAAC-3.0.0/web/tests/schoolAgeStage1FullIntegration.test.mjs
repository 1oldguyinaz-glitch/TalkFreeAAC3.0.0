import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCHOOL_AGE_STAGE_1_CATALOG as C } from '../src/data/schoolAgeStage1Catalog.js';
import { getBucketPage, getWordPage } from '../src/board/catalogSelectors.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const context = { stage: 1, ageBand: 'school_age', previousToken: null, pendingVerb: null, sentence: [] };
const roots = (column) => C[column].buckets.filter((bucket) => !bucket.parentBucketId);

test('catalog pagination fits the finalized Stage 1 UI without changing its capacities', () => {
  for (const column of [1, 2, 6]) {
    const pages = [...new Set(roots(column).map((bucket) => bucket.page))];
    for (const pageNumber of pages) {
      const page = getBucketPage(C, column, pageNumber, context);
      assert.ok(page.items.length <= 8, `Column ${column} bucket page ${pageNumber}`);
      assert.ok(page.items.every((item) => item.slot >= 1 && item.slot <= 8));
    }

    for (const bucket of C[column].buckets) {
      const wordPages = [...new Set(bucket.words.map((word) => word.page))];
      for (const pageNumber of wordPages) {
        const page = getWordPage(C, column, bucket.id, pageNumber, context);
        assert.ok(page.items.length <= 16, `${bucket.label} page ${pageNumber}`);
        assert.ok(page.items.every((item) => item.slot >= 1 && item.slot <= 16));
      }
    }
  }
  assert.deepEqual([...new Set(roots(6).map((bucket) => bucket.page))], [1, 2]);
});

test('image metadata never sends the locked UI to a missing file', () => {
  const suppliedAssets = new Set();
  for (const column of [1, 2, 6]) {
    for (const bucket of C[column].buckets) {
      assert.ok(bucket.plannedImageSrc, bucket.label);
      if (bucket.imageSrc) assert.equal(existsSync(join(root, 'public', bucket.imageSrc)), true, bucket.imageSrc);
      if (bucket.imageSrc === bucket.plannedImageSrc) {
        assert.equal(typeof bucket.imageIncludesLabel, 'boolean', bucket.imageSrc);
        suppliedAssets.add(bucket.imageSrc);
      }
      for (const word of bucket.words) {
        assert.ok(word.plannedImageSrc, word.label);
        if (word.imageSrc) assert.equal(existsSync(join(root, 'public', word.imageSrc)), true, word.imageSrc);
        if (word.imageSrc === word.plannedImageSrc) {
          assert.equal(typeof word.imageIncludesLabel, 'boolean', word.imageSrc);
          suppliedAssets.add(word.imageSrc);
        }
      }
    }
  }

  assert.equal([...suppliedAssets].filter((asset) => asset.startsWith('/p/s1/w/')).length, 413);
  assert.equal([...suppliedAssets].filter((asset) => asset.startsWith('/p/s1/b/')).length, 89);
});

test('all nested routes point to real buckets', () => {
  for (const column of [1, 6]) {
    const ids = new Set(C[column].buckets.map((bucket) => bucket.id));
    for (const bucket of C[column].buckets) {
      for (const nav of bucket.words.filter((word) => word.targetBucketId)) {
        assert.equal(ids.has(nav.targetBucketId), true, `${bucket.label} -> ${nav.label}`);
      }
    }
  }
});

test('Food and Drink keeps the approved hierarchy', () => {
  const foodAndDrink = roots(6).find((bucket) => bucket.label === 'Food and Drink');
  assert.deepEqual(foodAndDrink.words.map((word) => word.label), ['Food', 'Drinks', 'Utensils']);
  const food = C[6].buckets.find((bucket) => bucket.label === 'Food' && bucket.parentBucketId === foodAndDrink.id);
  assert.deepEqual(food.words.map((word) => word.label), ['Breakfast', 'Lunch', 'Dinner', 'Fruit', 'Vegetables', 'Snacks', 'Fast Food']);
  const drinks = C[6].buckets.find((bucket) => bucket.label === 'Drinks' && bucket.parentBucketId === foodAndDrink.id);
  assert.deepEqual(drinks.words.map((word) => word.label), ['Water', 'Juice', 'Milk', 'Soft Drinks', 'Other Drinks']);
});
