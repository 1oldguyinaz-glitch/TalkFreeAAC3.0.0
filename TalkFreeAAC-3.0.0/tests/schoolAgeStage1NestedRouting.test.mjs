import test from 'node:test';
import assert from 'node:assert/strict';
import { boardReducer, createInitialBoardState } from '../src/board/boardMachine.js';
import { SCHOOL_AGE_STAGE_1_CATALOG as C } from '../src/data/schoolAgeStage1Catalog.js';

const bucket = (column, label, parentLabel = null) => {
  const parent = parentLabel ? C[column].buckets.find((item) => item.label === parentLabel) : null;
  return C[column].buckets.find((item) =>
    item.label === label && (parent ? item.parentBucketId === parent.id : true)
  );
};

test('Food and Drink routes through Food and Snacks without adding sentence tokens', () => {
  let state = createInitialBoardState(1, 'school_age');
  state.activeColumn = 6;
  const root = bucket(6, 'Food and Drink');
  state = boardReducer(state, { type: 'OPEN_BUCKET', column: 6, bucketId: root.id, bucketLabel: root.label, page: 1 });
  const foodNav = root.words.find((word) => word.label === 'Food');
  state = boardReducer(state, { type: 'OPEN_NESTED_BUCKET', column: 6, bucketId: foodNav.targetBucketId, bucketLabel: foodNav.label });
  const food = C[6].buckets.find((item) => item.id === foodNav.targetBucketId);
  const snacksNav = food.words.find((word) => word.label === 'Snacks');
  state = boardReducer(state, { type: 'OPEN_NESTED_BUCKET', column: 6, bucketId: snacksNav.targetBucketId, bucketLabel: snacksNav.label });
  const snacks = C[6].buckets.find((item) => item.id === snacksNav.targetBucketId);
  assert.deepEqual(snacks.words.map((word) => word.label), ['Healthy Snacks', 'Treats']);
  assert.equal(state.sentence.length, 0);
  assert.equal(state.columnViews[6].history.length, 2);
});

test('Things separates School Things and Home Things', () => {
  const things = bucket(6, 'Things');
  assert.deepEqual(things.words.map((word) => word.label), ['School Things', 'Home Things']);
  const schoolThings = bucket(6, 'School Things', 'Things');
  const homeThings = bucket(6, 'Home Things', 'Things');
  assert.ok(schoolThings.words.some((word) => word.label === 'backpack'));
  assert.ok(schoolThings.words.some((word) => word.label === 'calculator'));
  assert.ok(homeThings.words.some((word) => word.label === 'key'));
  assert.ok(homeThings.words.some((word) => word.label === 'television'));
  assert.equal(things.words.some((word) => word.label === 'Work Things'), false);
});

test('School separates classrooms and subjects from physical school things', () => {
  const school = bucket(6, 'School');
  assert.deepEqual(
    school.words.map((word) => word.label),
    ['Classroom', 'Art', 'Music', 'Dance', 'Sports', 'Math', 'Science']
  );
  const art = bucket(6, 'Art', 'School');
  const science = bucket(6, 'Science', 'School');
  assert.ok(art.words.some((word) => word.label === 'paintbrush'));
  assert.ok(science.words.some((word) => word.label === 'experiment'));
});

test('People in Columns 1 and 6 share canonical source records', () => {
  const c1Teacher = C[1].buckets.flatMap((item) => item.words)
    .find((word) => word.label === 'teacher' && !word.targetBucketId);
  const c6Teacher = C[6].buckets.flatMap((item) => item.words)
    .find((word) => word.label === 'teacher' && !word.targetBucketId);
  assert.ok(c1Teacher);
  assert.ok(c6Teacher);
  assert.equal(c1Teacher.sourceId, c6Teacher.sourceId);
});
