import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boardReducer,
  createInitialBoardState
} from '../src/board/boardMachine.js';
import { immediateSpeechForSentenceChange } from '../src/board/speechPolicy.js';

const token = (id, text, pending = false) => ({ id, text, pending });

test('Every Word speaks only the newly added sentence token', () => {
  const previous = [token('i', 'I')];
  const next = [...previous, token('want', 'want')];

  assert.equal(immediateSpeechForSentenceChange(previous, next), 'want');
});

test('bucket and nested-topic navigation remain silent', () => {
  const sentence = [token('i', 'I'), token('want', 'want')];
  const initial = { ...createInitialBoardState(), sentence };
  const bucketOpened = boardReducer(initial, {
    type: 'OPEN_BUCKET',
    column: 1,
    bucketId: 'people',
    bucketLabel: 'People'
  });
  const nestedTopicOpened = boardReducer(bucketOpened, {
    type: 'OPEN_NESTED_BUCKET',
    column: 1,
    bucketId: 'family',
    bucketLabel: 'Family'
  });

  assert.equal(
    immediateSpeechForSentenceChange(initial.sentence, bucketOpened.sentence),
    null
  );
  assert.equal(
    immediateSpeechForSentenceChange(
      bucketOpened.sentence,
      nestedTopicOpened.sentence
    ),
    null
  );
});

test('Clear and other sentence reversals remain silent', () => {
  const previous = [token('i', 'I'), token('want', 'want')];
  const next = [token('i', 'I')];

  assert.equal(immediateSpeechForSentenceChange(previous, next), null);
});

test('a completed grammar choice speaks its final form', () => {
  const previous = [token('verb', 'want', true)];
  const next = [token('verb', 'wanted', false)];

  assert.equal(immediateSpeechForSentenceChange(previous, next), 'wanted');
});

test('quick communication phrases are spoken as one token', () => {
  const previous = [];
  const next = [token('no-thank-you', 'no thank you')];

  assert.equal(
    immediateSpeechForSentenceChange(previous, next),
    'no thank you'
  );
});
