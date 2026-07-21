import {
  copyFileSync,
  existsSync,
  mkdirSync,
  writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '..');
const currentPublic = join(webRoot, 'public');
const catalogPath = join(webRoot, 'src/data/schoolAgeStage1Catalog.js');
const sourcePublic = process.argv[2] ? resolve(process.argv[2]) : null;

if (!sourcePublic || !existsSync(sourcePublic)) {
  throw new Error(
    'Pass a source public directory containing the approved legacy images.'
  );
}

const sourceCatalogPath = join(
  dirname(sourcePublic),
  'src/data/schoolAgeStage1Catalog.js'
);
if (!existsSync(sourceCatalogPath)) {
  throw new Error(`Approved source catalog is missing: ${sourceCatalogPath}`);
}

const { SCHOOL_AGE_STAGE_1_CATALOG } = await import(
  pathToFileURL(sourceCatalogPath).href
);
const catalog = structuredClone(SCHOOL_AGE_STAGE_1_CATALOG);
const destinationSources = new Map();
let updatedReferences = 0;

for (const columnData of Object.values(catalog)) {
  for (const bucket of columnData.buckets ?? []) {
    for (const item of [bucket, ...(bucket.words ?? [])]) {
      if (!item.imageSrc || !item.plannedImageSrc) continue;

      const currentPath = join(currentPublic, item.imageSrc);
      if (existsSync(currentPath)) continue;

      const sourcePath = join(sourcePublic, item.imageSrc);
      if (!existsSync(sourcePath)) {
        throw new Error(`Approved source image is missing: ${item.imageSrc}`);
      }

      const destinationPath = join(currentPublic, item.plannedImageSrc);
      const previousSource = destinationSources.get(destinationPath);
      if (previousSource && previousSource !== sourcePath) {
        throw new Error(
          `Two source images resolve to one short path: ${item.plannedImageSrc}`
        );
      }

      destinationSources.set(destinationPath, sourcePath);
      item.imageSrc = item.plannedImageSrc;
      updatedReferences += 1;
    }
  }
}

for (const [destinationPath, sourcePath] of destinationSources) {
  mkdirSync(dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
}

writeFileSync(
  catalogPath,
  `export const SCHOOL_AGE_STAGE_1_CATALOG = Object.freeze(${JSON.stringify(
    catalog,
    null,
    2
  )});\n`
);

console.log(
  `Normalized ${updatedReferences} references into `
  + `${destinationSources.size} short image files.`
);
