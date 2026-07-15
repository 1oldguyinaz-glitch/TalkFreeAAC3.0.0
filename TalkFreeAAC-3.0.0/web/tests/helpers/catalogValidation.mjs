export function validateCatalog(catalog) {
  const errors = [];
  const bucketIds = new Set();
  const wordIds = new Set();
  let bucketCount = 0;
  let wordCount = 0;

  for (let column = 1; column <= 6; column += 1) {
    const definition = catalog[column];
    if (!definition) {
      errors.push(`Missing column ${column}.`);
      continue;
    }
    if (definition.column !== column) errors.push(`Column ${column} has mismatched column metadata.`);

    const bucketCoordinates = new Set();
    for (const bucket of definition.buckets ?? []) {
      bucketCount += 1;
      if (bucketIds.has(bucket.id)) errors.push(`Duplicate bucket id: ${bucket.id}`);
      bucketIds.add(bucket.id);
      if (bucket.column !== column) errors.push(`Bucket ${bucket.id} is assigned to the wrong column.`);
      if (bucket.slot < 1 || bucket.slot > 6) errors.push(`Bucket ${bucket.id} has invalid slot ${bucket.slot}.`);
      const bucketCoordinate = `${bucket.page ?? 1}:${bucket.slot}`;
      if (bucketCoordinates.has(bucketCoordinate)) errors.push(`Duplicate bucket coordinate in Column ${column}: ${bucketCoordinate}`);
      bucketCoordinates.add(bucketCoordinate);
      if (!bucket.colorRole) errors.push(`Bucket ${bucket.id} is missing a Fitzgerald color role.`);
      if (!bucket.visibleByStage?.length) errors.push(`Bucket ${bucket.id} is unreachable at every stage.`);
      if (Object.keys(bucket.minimumStageByAgeBand ?? {}).sort().join(',') !== 'adult,early_childhood,school_age,teen') errors.push(`Bucket ${bucket.id} is missing age-stage metadata.`);

      const wordCoordinates = new Set();
      for (const word of bucket.words ?? []) {
        wordCount += 1;
        if (wordIds.has(word.id)) errors.push(`Duplicate word id: ${word.id}`);
        wordIds.add(word.id);
        if (word.column !== column) errors.push(`Word ${word.id} is assigned to the wrong column.`);
        if (word.slot < 1 || word.slot > 12) errors.push(`Word ${word.id} has invalid slot ${word.slot}.`);
        const wordCoordinate = `${word.page ?? 1}:${word.slot}`;
        if (wordCoordinates.has(wordCoordinate)) errors.push(`Duplicate word coordinate in bucket ${bucket.id}: ${wordCoordinate}`);
        wordCoordinates.add(wordCoordinate);
        if (!word.visibleByStage?.length) errors.push(`Word ${word.id} is unreachable at every stage.`);
        if (Object.keys(word.minimumStageByAgeBand ?? {}).sort().join(',') !== 'adult,early_childhood,school_age,teen') errors.push(`Word ${word.id} is missing age-stage metadata.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    bucketCount,
    wordCount
  };
}
