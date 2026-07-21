import test from 'node:test';
import assert from 'node:assert/strict';
import { bucketRequestContextKey, bucketRequestIsCurrent } from '../src/board/requestGuard.js';

const state = {
  ageBand: 'adult',
  stage: 4,
  activeColumn: 1,
  columnViews: { 1: { mode: 'buckets', bucketId: null, page: 1, history: [] } },
  contentSettings: { showSchool: true, showPrivateParts: false }
};

test('bucket request context changes with profile, column, view, and content gates', () => {
  const initial = bucketRequestContextKey(state);
  assert.notEqual(bucketRequestContextKey({ ...state, stage: 3 }), initial);
  assert.notEqual(bucketRequestContextKey({ ...state, activeColumn: 2 }), initial);
  assert.notEqual(bucketRequestContextKey({
    ...state,
    columnViews: { ...state.columnViews, 1: { ...state.columnViews[1], page: 2 } }
  }), initial);
  assert.notEqual(bucketRequestContextKey({
    ...state,
    columnViews: { ...state.columnViews, 1: { mode: 'words', bucketId: 'people', page: 1, history: ['community'] } }
  }), initial);
  assert.notEqual(bucketRequestContextKey({
    ...state,
    contentSettings: { ...state.contentSettings, showSchool: false }
  }), initial);
});

test('only the newest request from the current context can change the board', () => {
  const key = 'adult|4|1|buckets||1||school:on|private:off';
  assert.equal(bucketRequestIsCurrent({ requestId: 3, latestRequestId: 3, contextKey: key, currentContextKey: key }), true);
  assert.equal(bucketRequestIsCurrent({ requestId: 2, latestRequestId: 3, contextKey: key, currentContextKey: key }), false);
  assert.equal(bucketRequestIsCurrent({ requestId: 3, latestRequestId: 3, contextKey: key, currentContextKey: 'teen|1|1|buckets||1||school:on|private:off' }), false);
});
