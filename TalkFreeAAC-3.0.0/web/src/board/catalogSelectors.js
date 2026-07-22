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

function visibleBucketList(items, context) {
  const pageCapacity = Math.max(
    ROOT_BUCKET_SLOT_COUNT,
    ...items.map((item) => item.slot ?? 1)
  );
  const positioned = items
    .map((item) => ({
      ...item,
      page: 1,
      slot: ((item.page ?? 1) - 1) * pageCapacity + (item.slot ?? 1)
    }))
    .sort((left, right) => left.slot - right.slot);
  const slotCount = Math.max(
    ROOT_BUCKET_SLOT_COUNT,
    ...positioned.map((item) => item.slot)
  );
  return {
    pages: positioned.length ? [1] : [],
    page: 1,
    items: positioned.filter((item) => itemIsCongruent(item, context)),
    slotCount
  };
}

export function firstVisibleWordPage(words, context) {
  const pages = [...new Set(
    words.filter((word) => itemIsCongruent(word, context)).map((word) => word.page ?? 1)
  )].sort((a, b) => a - b);
  return pages[0] ?? 1;
}

export function getBucketPage(catalog, column, page, context) {
  const rootBuckets = getColumnCatalog(catalog, column).buckets.filter(
    (bucket) => !bucket.parentBucketId
  );
  return visibleBucketList(rootBuckets, context);
}

export function getWordPage(catalog, column, bucketId, page, context) {
  const bucket = getBucket(catalog, column, bucketId);
  const pageData = visiblePageData(bucket?.words ?? [], page, context);
  const highestSlot = Math.max(0, ...pageData.items.map((item) => item.slot ?? 0));
  return {
    bucket,
    ...pageData,
    slotCount: bucket?.virtualBucket
      ? Math.max(WORD_SLOT_COUNT, highestSlot)
      : WORD_SLOT_COUNT
  };
}

export function itemsByFixedSlot(items, slotCount) {
  const bySlot = new Map(items.map((item) => [item.slot, item]));
  return Array.from({ length: slotCount }, (_, index) => bySlot.get(index + 1) ?? null);
}
