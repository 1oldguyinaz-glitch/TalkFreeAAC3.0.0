import test from 'node:test';
import assert from 'node:assert/strict';
import { getFitzgeraldColor } from '../src/board/fitzgerald.js';

test('Modified Fitzgerald roles resolve to stable grammatical colors', () => {
  assert.equal(getFitzgeraldColor({ role: 'pronoun' }, 1), 'yellow');
  assert.equal(getFitzgeraldColor({ role: 'verb' }, 2), 'green');
  assert.equal(getFitzgeraldColor({ role: 'preposition' }, 3), 'pink');
  assert.equal(getFitzgeraldColor({ role: 'possessive_pronoun' }, 4), 'gray');
  assert.equal(getFitzgeraldColor({ role: 'adjective' }, 5), 'blue');
  assert.equal(getFitzgeraldColor({ role: 'noun' }, 6), 'orange');
  assert.equal(getFitzgeraldColor({ role: 'question' }, 1), 'purple');
  assert.equal(getFitzgeraldColor({ role: 'negation' }, 3), 'red');
  assert.equal(getFitzgeraldColor({ role: 'conjunction' }, 3), 'white');
});
