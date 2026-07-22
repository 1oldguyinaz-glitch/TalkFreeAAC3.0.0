import { useCallback, useEffect, useRef, useState } from 'react';
import { COLUMN_IDS } from '../board/constants.js';
import { buildCanonicalBucketHierarchy } from './catalogHierarchy.js';
import { buildCanonicalWordHierarchy } from './canonicalWordHierarchy.js';
import { publicAssetUrl } from './publicAssetUrl.js';

function emptyCatalog() {
  return Object.fromEntries(COLUMN_IDS.map((column) => [column, { column, buckets: [] }]));
}

async function fetchJson(relativePath) {
  const response = await fetch(publicAssetUrl(relativePath), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status}): ${relativePath}`);
  return response.json();
}

export function useBoardCatalog() {
  const [catalog, setCatalog] = useState(emptyCatalog);
  const [manifest, setManifest] = useState(null);
  const [directoriesReady, setDirectoriesReady] = useState(false);
  const [error, setError] = useState(null);
  const directoryCatalogs = useRef(new Map());
  const loadedWords = useRef(new Map());
  const wordRequests = useRef(new Map());

  useEffect(() => {
    let cancelled = false;
    async function loadDirectories() {
      try {
        const [manifestPayload, ...payloads] = await Promise.all([
          fetchJson('catalog/manifest.json'),
          ...COLUMN_IDS.map((column) => fetchJson(`catalog/columns/column${column}.directory.json`))
        ]);
        if (cancelled) return;
        directoryCatalogs.current = new Map(
          payloads.map((payload) => [payload.column, payload])
        );
        setManifest(manifestPayload);
        setCatalog(Object.fromEntries(payloads.map((payload) => [
          payload.column,
          buildCanonicalBucketHierarchy({
            column: payload.column,
            metadata: payload.metadata,
            buckets: payload.buckets.map((bucket) => ({ ...bucket, words: [] }))
          })
        ])));
        setDirectoriesReady(true);
      } catch (catalogError) {
        if (!cancelled) setError(catalogError);
      }
    }
    loadDirectories();
    return () => { cancelled = true; };
  }, []);

  const loadColumnWords = useCallback(async (column) => {
    if (loadedWords.current.has(column)) return loadedWords.current.get(column);
    if (!wordRequests.current.has(column)) {
      const request = fetchJson(`catalog/columns/column${column}.words.json`)
        .then((payload) => {
          const sourceCatalog = directoryCatalogs.current.get(column);
          if (!sourceCatalog) {
            throw new Error(`Catalog directory is not ready for Column ${column}.`);
          }
          const columnCatalog = buildCanonicalWordHierarchy(sourceCatalog, payload);
          const loaded = { wordsPayload: payload, columnCatalog };
          loadedWords.current.set(column, loaded);
          setCatalog((current) => ({ ...current, [column]: columnCatalog }));
          return loaded;
        })
        .catch((catalogError) => {
          setError(catalogError);
          throw catalogError;
        })
        .finally(() => wordRequests.current.delete(column));
      wordRequests.current.set(column, request);
    }
    return wordRequests.current.get(column);
  }, []);

  return { catalog, manifest, directoriesReady, error, loadColumnWords };
}
