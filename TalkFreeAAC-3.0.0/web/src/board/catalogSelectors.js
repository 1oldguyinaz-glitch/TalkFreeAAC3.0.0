import { ROOT_BUCKET_SLOT_COUNT, WORD_SLOT_COUNT } from './constants.js';
import { itemIsCongruent } from './congruence.js';

export function getColumnCatalog(catalog, column) {
  return catalog[column] ?? { column, buckets: [] };
}

export function getBucket(catalog, column, bucketId) {
  return getColumnCatalog(catalog, column).buckets.find((bucket) => bucket.id === bucketId) ?? null;
}

function visiblePageData(items, requestedPage, context) {
  const congruent = items.filter((item) => itemIsCongruent(item, context));
  const pages = [...new Set(congruent.map((item) => item.page ?? 1))].sort((a, b) => a - b);
  const page = pages.includes(requestedPage) ? requestedPage : (pages[0] ?? 1);
  return { pages, page, items: congruent.filter((item) => (item.page ?? 1) === page) };
}

export function firstVisibleWordPage(words, context) {
  const pages = [...new Set(
    words.filter((word) => itemIsCongruent(word, context)).map((word) => word.page ?? 1)
  )].sort((a, b) => a - b);
  return pages[0] ?? 1;
}

export function getBucketPage(catalog, column, page, context) {
  return { ...visiblePageData(getColumnCatalog(catalog, column).buckets, page, context), slotCount: ROOT_BUCKET_SLOT_COUNT };
}

export function getWordPage(catalog, column, bucketId, page, context) {
  const bucket = getBucket(catalog, column, bucketId);
  return { bucket, ...visiblePageData(bucket?.words ?? [], page, context), slotCount: WORD_SLOT_COUNT };
}

export function itemsByFixedSlot(items, slotCount) {
  const bySlot = new Map(items.map((item) => [item.slot, item]));
  return Array.from({ length: slotCount }, (_, index) => bySlot.get(index + 1) ?? null);
}
