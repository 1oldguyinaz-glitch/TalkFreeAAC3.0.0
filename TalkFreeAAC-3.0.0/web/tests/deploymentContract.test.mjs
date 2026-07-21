import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const webPackage = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const lockSource = await readFile(new URL('../package-lock.json', import.meta.url), 'utf8');
const viteSource = await readFile(new URL('../vite.config.js', import.meta.url), 'utf8');
const workflowSource = await readFile(new URL('../../../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');

test('production dependencies are pinned and portable outside this workspace', () => {
  for (const [name, version] of Object.entries(webPackage.dependencies)) {
    assert.match(version, /^\d+\.\d+\.\d+$/, `${name} must use an exact version`);
  }
  assert.doesNotMatch(lockSource, /internal\.api\.openai|packages\.applied-caas/);
  assert.match(lockSource, /https:\/\/registry\.npmjs\.org\//);
});

test('GitHub Pages workflow installs, builds, and deploys the web package', () => {
  assert.match(viteSource, /base:\s*'\.\/'/);
  assert.match(workflowSource, /working-directory: TalkFreeAAC-3\.0\.0\/web/);
  assert.match(workflowSource, /run: npm ci/);
  assert.match(workflowSource, /run: npm run build/);
  assert.match(workflowSource, /actions\/checkout@v6/);
  assert.match(workflowSource, /actions\/setup-node@v7/);
  assert.match(workflowSource, /actions\/configure-pages@v6/);
  assert.match(workflowSource, /actions\/upload-pages-artifact@v5/);
  assert.match(workflowSource, /actions\/deploy-pages@v4/);
});
