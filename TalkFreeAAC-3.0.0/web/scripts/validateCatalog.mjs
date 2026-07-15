import { validateCatalog } from '../tests/helpers/catalogValidation.mjs';
import { loadCompiledCatalog } from '../tests/helpers/loadCompiledCatalog.mjs';

const { manifest, catalog } = await loadCompiledCatalog();
const result = validateCatalog(catalog);

if (!result.ok) {
  console.error(result.errors.join('\n'));
  process.exitCode = 1;
} else {
  const accounted = result.wordCount + manifest.totalAlwaysActiveControls;
  console.log(
    `Catalog valid: ${result.bucketCount} buckets, ${result.wordCount} bucketed words, `
    + `${manifest.totalAlwaysActiveControls} always-active controls, ${accounted} total records.`
  );
}
