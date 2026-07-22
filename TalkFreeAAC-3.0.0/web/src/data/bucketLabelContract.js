export const SCHOOL_STAGE_ONE_ROOT_LABELS = Object.freeze({
  1: Object.freeze(['Who', 'Belongs To', 'People', 'Phrases', 'Questions']),
  2: Object.freeze([
    'Feelings',
    'Moving',
    'Actions',
    'Talking',
    'Learning',
    'Doing',
    'Needs',
    'Support'
  ]),
  6: Object.freeze([
    'Food and Drink',
    'People',
    'Feelings',
    'Play',
    'Places',
    'Care',
    'Body Parts',
    'Things',
    'School',
    'Clothes',
    'Technology',
    'Control'
  ])
});

export const EXPANDED_STAGE_ONE_ROOT_LABELS = Object.freeze({
  ...SCHOOL_STAGE_ONE_ROOT_LABELS,
  2: Object.freeze([
    ...SCHOOL_STAGE_ONE_ROOT_LABELS[2],
    'Technology',
    'Independence'
  ])
});

export const OLDER_AGE_BUCKET_LABEL_CONTRACT = Object.freeze({
  school_age: SCHOOL_STAGE_ONE_ROOT_LABELS,
  teen: EXPANDED_STAGE_ONE_ROOT_LABELS,
  adult: EXPANDED_STAGE_ONE_ROOT_LABELS
});

export function requiredRootLabels(ageBand, column) {
  return OLDER_AGE_BUCKET_LABEL_CONTRACT[ageBand]?.[column] ?? [];
}
