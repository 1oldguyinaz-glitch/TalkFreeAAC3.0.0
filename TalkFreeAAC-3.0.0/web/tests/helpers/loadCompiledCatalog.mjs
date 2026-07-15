import { readFile } from 'node:fs/promises';

const catalogRoot = new URL('../../public/catalog/', import.meta.url);

async function readJson(relativePath) {
  const url = new URL(relativePath, catalogRoot);
  return JSON.parse(await readFile(url, 'utf8'));
}

export async function loadCompiledCatalog() {
  const manifest = await readJson('manifest.json');
  const catalog = {};
  const wordsPayloads = {};

  for (let column = 1; column <= 6; column += 1) {
    const directory = await readJson(`columns/column${column}.directory.json`);
    const words = await readJson(`columns/column${column}.words.json`);
    wordsPayloads[column] = words;

    catalog[column] = {
      column,
      metadata: directory.metadata,
      buckets: directory.buckets.map((bucket) => ({
        ...bucket,
        words: words.buckets[bucket.id] ?? []
      }))
    };
  }

  return { manifest, catalog, wordsPayloads };
}
