import test from 'node:test';
import assert from 'node:assert/strict';
import { activeViewFocusKey, shouldMoveBoardFocus } from '../src/board/focusPolicy.js';

test('focus key changes when AXIS advances or a bucket view changes', () => {
  const state = { activeColumn: 1, columnViews: { 1: { mode: 'buckets', page: 1 } } };
  assert.notEqual(activeViewFocusKey(state), activeViewFocusKey({ activeColumn: 2, columnViews: { 2: { mode: 'buckets', page: 1 } } }));
  assert.notEqual(activeViewFocusKey(state), activeViewFocusKey({ activeColumn: 1, columnViews: { 1: { mode: 'words', bucketId: 'actions', page: 1 } } }));
});

test('board focus does not leave an open modal dialog', () => {
  assert.equal(shouldMoveBoardFocus('1|buckets|||1', '2|buckets|||1', false), true);
  assert.equal(shouldMoveBoardFocus('1|buckets|||1', '2|buckets|||1', true), false);
  assert.equal(shouldMoveBoardFocus('1|buckets|||1', '1|buckets|||1', false), false);
});
