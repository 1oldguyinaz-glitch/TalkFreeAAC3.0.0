import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAssetUrl } from '../src/data/publicAssetUrl.js';

test('public assets resolve beneath a GitHub Pages project path', () => {
  assert.equal(publicAssetUrl('/p/s1/w/help.jpg', '/TalkFreeAAC3.0.0/'), '/TalkFreeAAC3.0.0/p/s1/w/help.jpg');
  assert.equal(publicAssetUrl('catalog/manifest.json', './'), './catalog/manifest.json');
});

test('external and embedded asset URLs remain unchanged', () => {
  assert.equal(publicAssetUrl('https://example.com/image.png', '/TalkFreeAAC3.0.0/'), 'https://example.com/image.png');
  assert.equal(publicAssetUrl('data:image/png;base64,abc', './'), 'data:image/png;base64,abc');
});
