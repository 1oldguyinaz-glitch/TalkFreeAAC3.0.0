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

test('all Stage 1 root buckets share one no-pagination surface', () => {
  for (const column of [1, 2, 6]) {
    const page = getBucketPage(C, column, 1, context);
    assert.deepEqual(page.pages, [1]);
    assert.ok(page.items.length <= 16, `Column ${column} combined bucket list`);
    assert.ok(page.items.every((item) => item.slot >= 1 && item.slot <= 16));
    assert.equal(new Set(page.items.map((item) => item.slot)).size, page.items.length);

    for (const bucket of C[column].buckets) {
      const wordPages = [...new Set(bucket.words.map((word) => word.page))];
      for (const pageNumber of wordPages) {
        const page = getWordPage(C, column, bucket.id, pageNumber, context);
        assert.ok(page.items.length <= 16, `${bucket.label} page ${pageNumber}`);
        assert.ok(page.items.every((item) => item.slot >= 1 && item.slot <= 16));
      }
    }
  }
  assert.equal(getBucketPage(C, 6, 1, context).items.length, 12);
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
