import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const settingsSource = await readFile(new URL('../src/board/BoardSettings.jsx', import.meta.url), 'utf8');
const boardSource = await readFile(new URL('../src/board/Board.jsx', import.meta.url), 'utf8');
const exitLockSource = await readFile(new URL('../src/board/ExitLock.jsx', import.meta.url), 'utf8');

test('Settings dialog supports focus entry, containment, Escape, and restoration', () => {
  assert.match(settingsSource, /focusableElements\(\)\[0\]\?\.focus\(\)/);
  assert.match(settingsSource, /event\.key === 'Escape'/);
  assert.match(settingsSource, /event\.key !== 'Tab'/);
  assert.match(settingsSource, /previousFocusRef\.current/);
  assert.match(settingsSource, /aria-modal="true"/);
});

test('AXIS view transitions move focus without stealing it from a modal', () => {
  assert.match(boardSource, /activeViewFocusKey\(state\)/);
  assert.match(boardSource, /dialogOwnsFocus/);
  assert.match(boardSource, /querySelector\('button:not\(\[disabled\]\)'\)/);
  assert.match(boardSource, /preventScroll: true/);
});

test('Exit lock is caregiver controlled and intercepts accidental page exits', () => {
  assert.match(settingsSource, /Exit lock/);
  assert.match(settingsSource, /onExitLockChange\(event\.target\.checked\)/);
  assert.match(boardSource, /exitLockEnabled/);
  assert.match(exitLockSource, /beforeunload/);
  assert.match(exitLockSource, /popstate/);
  assert.match(exitLockSource, /Hold to unlock/);
  assert.match(exitLockSource, /LONG_PRESS_MS = 1800/);
});
