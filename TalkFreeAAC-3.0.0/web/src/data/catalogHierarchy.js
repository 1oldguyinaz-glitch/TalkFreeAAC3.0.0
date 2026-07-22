const AGE_BANDS = Object.freeze([
  'early_childhood',
  'school_age',
  'teen',
  'adult'
]);

const STAGES = Object.freeze([1, 2, 3, 4]);
const NAVIGATION_LIMIT = 16;

const OLDER_ROOT_STAGE_ONE_LABELS = Object.freeze({
  1: new Set(['Who', 'Belongs To', 'People', 'Phrases', 'Questions']),
  2: new Set([
    'Feelings', 'Moving', 'Actions', 'Talking', 'Learning',
    'Doing', 'Needs', 'Support', 'Technology', 'Independence'
  ]),
  6: new Set([
    'Food and Drink', 'People', 'Feelings', 'Play', 'Places', 'Care',
    'Body Parts', 'Things', 'School', 'Clothes', 'Technology', 'Control'
  ])
});

const SCHOOL_COLUMN_TWO_STAGE_ONE_LABELS = new Set([
  'Feelings', 'Moving', 'Actions', 'Talking',
  'Learning', 'Doing', 'Needs', 'Support'
]);

const COLUMN_ROLE = Object.freeze({
  1: 'initiator',
  2: 'verb',
  3: 'preposition',
  4: 'determiner',
  5: 'descriptor',
  6: 'noun'
});

const ENTRY_KIND_LABELS = Object.freeze({
  word: 'Words',
  words: 'Words',
  compound: 'Compounds',
  compounds: 'Compounds',
  phrase: 'Phrases',
  phrases: 'Phrases',
  template: 'Templates',
  templates: 'Templates',
  other: 'More'
});

const BRANCH_LABELS = Object.freeze({
  accessibility_devices: 'Accessibility',
  academic_deep: 'Academic',
  animals_deep: 'Animals',
  behavior_support: 'Behavior Support',
  body_pain: 'Body and Pain',
  choice_preference: 'Choices and Preferences',
  communication_repair: 'Communication Repair',
  community_errands: 'Community Errands',
  digital_safety: 'Digital Safety',
  emergency_deep: 'Emergency Details',
  expanded_descriptors: 'Expanded Descriptions',
  expanded_verbs: 'Expanded Actions',
  food_cooking_deep: 'Food and Cooking',
  food_drink: 'Food and Drink',
  grammar_language: 'Grammar and Language',
  holidays_events: 'Holidays and Events',
  home_living_deep: 'Home Living',
  household_items_deep: 'Household Items',
  math_deep: 'Math',
  medical_deep: 'Medical',
  money_life_skills: 'Money and Life Skills',
  music_art_creativity: 'Music, Art, and Creativity',
  nature_animals: 'Nature and Animals',
  parent_gated_safety_deep: 'Caregiver-Gated Safety',
  reading_writing: 'Reading and Writing',
  safety_sensitive: 'Sensitive Safety',
  science_nature: 'Science and Nature',
  social_boundaries: 'Social Boundaries',
  sports_movement: 'Sports and Movement',
  states_conditions: 'States and Conditions',
  technology_media: 'Technology and Media',
  therapy_goals: 'Therapy and Goals',
  time_routines: 'Time and Routines',
  travel_navigation: 'Travel and Navigation',
  weather_clothing: 'Weather and Clothing',
  work_vocational: 'Work and Vocational'
});

export const CANONICAL_BUCKET_GROUPS = Object.freeze({
  1: Object.freeze([
    { id: 'who', label: 'Who', symbol: '👤', branches: ['core', 'grammar_language'] },
    { id: 'belongs-to', label: 'Belongs To', symbol: '🫴', branches: ['choice_preference', 'household'] },
    { id: 'people', label: 'People', symbol: '👥', branches: ['people', 'social'] },
    { id: 'phrases', label: 'Phrases', symbol: '💬', branches: ['communication_repair', 'social_boundaries'], fallback: true },
    { id: 'questions', label: 'Questions', symbol: '❓', branches: ['questions'] }
  ]),
  2: Object.freeze([
    { id: 'feelings', label: 'Feelings', symbol: '🙂', branches: ['feelings', 'states_conditions', 'temperature', 'body_pain'] },
    { id: 'moving', label: 'Moving', symbol: '🏃', branches: ['transportation', 'travel_navigation', 'sports_movement'] },
    { id: 'actions', label: 'Actions', symbol: '⚡', branches: ['actions', 'expanded_verbs', 'core', 'descriptors'] },
    { id: 'talking', label: 'Talking', symbol: '💬', branches: ['communication_repair', 'social', 'social_boundaries', 'people', 'questions'] },
    { id: 'learning', label: 'Learning', symbol: '📚', branches: ['school', 'academic_deep', 'math_deep', 'reading_writing', 'science_nature', 'grammar_language'] },
    { id: 'doing', label: 'Doing', symbol: '🛠️', branches: ['household', 'places', 'play', 'holidays_events', 'nature_animals', 'music_art_creativity'] },
    { id: 'needs', label: 'Needs', symbol: '🫶', branches: ['life_skills', 'food_drink', 'grocery', 'medical_deep'] },
    { id: 'support', label: 'Support', symbol: '🤝', branches: ['behavior_support', 'regulation', 'sensory', 'therapy_goals', 'accessibility_devices', 'emergency', 'emergency_deep', 'safety_sensitive', 'parent_gated_safety_deep'] },
    { id: 'technology', label: 'Technology', symbol: '💻', branches: ['technology_media'] },
    { id: 'independence', label: 'Independence', symbol: '🧭', branches: ['money_life_skills', 'work_vocational', 'community_errands', 'time_routines', 'digital_safety'], fallback: true }
  ]),
  3: Object.freeze([
    { id: 'core-modifiers', label: 'Core Modifiers', symbol: '🔧', branches: ['core', 'grammar_language', 'expanded_descriptors', 'descriptors'] },
    { id: 'questions-choices', label: 'Questions and Choices', symbol: '❓', branches: ['questions', 'choice_preference'] },
    { id: 'time-routines', label: 'Time and Routines', symbol: '🕒', branches: ['time_routines'] },
    { id: 'places-movement', label: 'Places and Movement', symbol: '🧭', branches: ['places', 'travel_navigation', 'transportation', 'sports_movement', 'community'] },
    { id: 'social-repair', label: 'Social and Repair', symbol: '💬', branches: ['communication_repair', 'social', 'social_boundaries'] },
    { id: 'body-sensory', label: 'Body and Sensory', symbol: '🧍', branches: ['body_pain', 'sensory', 'medical_deep', 'states_conditions', 'regulation'] },
    { id: 'safety-emergency', label: 'Safety and Emergency', symbol: '🛡️', branches: ['emergency', 'emergency_deep', 'digital_safety', 'safety_sensitive', 'parent_gated_safety_deep'] },
    { id: 'learning', label: 'Learning', symbol: '📚', branches: ['academic_deep', 'math_deep', 'reading_writing', 'school', 'science_nature'] },
    { id: 'technology-access', label: 'Technology and Access', symbol: '💻', branches: ['technology_media', 'accessibility_devices'] },
    { id: 'daily-life', label: 'Daily Life', symbol: '🏠', branches: ['life_skills', 'money_life_skills', 'actions'] }
  ]),
  4: Object.freeze([
    { id: 'core-ownership', label: 'Core Ownership', symbol: '🫴', branches: ['core', 'choice_preference'] },
    { id: 'questions', label: 'Questions', symbol: '❓', branches: ['questions'] },
    { id: 'social-repair', label: 'Social and Repair', symbol: '💬', branches: ['communication_repair', 'social', 'social_boundaries'] },
    { id: 'access-support', label: 'Access and Support', symbol: '🤝', branches: ['accessibility_devices', 'therapy_goals', 'sensory', 'temperature'] },
    { id: 'body-health', label: 'Body and Health', symbol: '🧍', branches: ['body_pain', 'medical_deep'] },
    { id: 'safety-emergency', label: 'Safety and Emergency', symbol: '🛡️', branches: ['emergency', 'emergency_deep', 'safety_sensitive', 'parent_gated_safety_deep'] },
    { id: 'daily-life', label: 'Daily Life', symbol: '🏠', branches: ['life_skills', 'household', 'food_drink', 'food_cooking_deep', 'play'] },
    { id: 'places-travel', label: 'Places and Travel', symbol: '🧭', branches: ['places', 'travel_navigation', 'transportation', 'weather_clothing'] },
    { id: 'learning-work', label: 'Learning and Work', symbol: '🎓', branches: ['academic_deep', 'school', 'money_life_skills', 'work_vocational', 'actions', 'regulation'] }
  ]),
  5: Object.freeze([
    { id: 'feelings-states', label: 'Feelings and States', symbol: '🙂', branches: ['feelings', 'states_conditions', 'regulation', 'behavior_support', 'choice_preference'] },
    { id: 'body-sensory', label: 'Body and Sensory', symbol: '🧍', branches: ['body_pain', 'sensory', 'temperature', 'medical_deep', 'personal_care'] },
    { id: 'core-descriptions', label: 'Core Descriptions', symbol: '🔎', branches: ['descriptors', 'expanded_descriptors', 'grammar_language', 'actions'] },
    { id: 'people-social', label: 'People and Social', symbol: '👥', branches: ['social', 'social_boundaries', 'communication_repair', 'questions', 'people'] },
    { id: 'food-home', label: 'Food and Home', symbol: '🏠', branches: ['food_drink', 'food_cooking_deep', 'grocery', 'household', 'household_items_deep', 'home_living_deep'] },
    { id: 'places-travel', label: 'Places and Travel', symbol: '🧭', branches: ['places', 'travel_navigation', 'transportation', 'community_errands', 'weather_clothing'] },
    { id: 'learning-work', label: 'Learning and Work', symbol: '🎓', branches: ['school', 'academic_deep', 'math_deep', 'reading_writing', 'science_nature', 'therapy_goals', 'work_vocational'] },
    { id: 'play-interests', label: 'Play and Interests', symbol: '🎨', branches: ['play', 'music_art_creativity', 'sports_movement', 'nature_animals', 'animals_deep', 'holidays_events'] },
    { id: 'technology-access', label: 'Technology and Access', symbol: '💻', branches: ['technology_media', 'digital_safety', 'accessibility_devices'] },
    { id: 'safety-emergency', label: 'Safety and Emergency', symbol: '🛡️', branches: ['emergency', 'emergency_deep', 'safety_sensitive', 'parent_gated_safety_deep'] },
    { id: 'daily-life', label: 'Daily Life', symbol: '🧺', branches: ['life_skills', 'money_life_skills'] }
  ]),
  6: Object.freeze([
    { id: 'food-drink', label: 'Food and Drink', symbol: '🍽️', branches: ['food_drink', 'grocery', 'food_cooking_deep'] },
    { id: 'people', label: 'People', symbol: '👥', branches: ['people', 'social', 'social_boundaries', 'communication_repair'] },
    { id: 'feelings', label: 'Feelings', symbol: '🙂', branches: ['feelings', 'choice_preference', 'states_conditions', 'regulation', 'behavior_support'] },
    { id: 'play', label: 'Play', symbol: '🎮', branches: ['play', 'sports_movement', 'music_art_creativity', 'holidays_events', 'nature_animals', 'animals_deep'] },
    { id: 'places', label: 'Places', symbol: '📍', branches: ['places', 'community', 'community_errands', 'travel_navigation', 'transportation'] },
    { id: 'care', label: 'Care', symbol: '🧼', branches: ['personal_care', 'medical_deep', 'therapy_goals', 'life_skills', 'accessibility_devices'] },
    { id: 'body-parts', label: 'Body Parts', symbol: '🧍', branches: ['body_pain', 'sensory', 'temperature'] },
    { id: 'things', label: 'Things', symbol: '📦', branches: ['household', 'household_items_deep', 'home_living_deep', 'actions', 'descriptors', 'questions', 'time_routines'] },
    { id: 'school', label: 'School', symbol: '🏫', branches: ['school', 'academic_deep', 'math_deep', 'reading_writing', 'science_nature', 'grammar_language'] },
    { id: 'clothes', label: 'Clothes', symbol: '👕', branches: ['weather_clothing'] },
    { id: 'technology', label: 'Technology', symbol: '💻', branches: ['technology_media', 'digital_safety'] },
    { id: 'control', label: 'Control', symbol: '🎛️', branches: ['emergency', 'emergency_deep', 'safety_sensitive', 'parent_gated_safety_deep', 'money_life_skills', 'work_vocational', 'expanded_verbs'] }
  ])
});

function slug(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function humanizeBranch(branch) {
  if (BRANCH_LABELS[branch]) return BRANCH_LABELS[branch];
  return String(branch)
    .replace(/_deep$/i, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function entryKind(bucket) {
  const explicit = String(bucket.entryKind ?? '').toLowerCase();
  if (ENTRY_KIND_LABELS[explicit]) return explicit;
  const label = String(bucket.label ?? '').toLowerCase();
  for (const kind of ['words', 'compounds', 'phrases', 'templates']) {
    if (label.includes(kind)) return kind;
  }
  return 'other';
}

function minimumStages(items) {
  return Object.fromEntries(AGE_BANDS.map((ageBand) => {
    const stages = items
      .map((item) => item.minimumStageByAgeBand?.[ageBand])
      .filter((stage) => Number.isInteger(stage));
    return [ageBand, stages.length ? Math.min(...stages) : null];
  }));
}

function visibleStages(items) {
  return [...new Set(items.flatMap((item) => item.visibleByStage ?? STAGES))]
    .sort((left, right) => left - right);
}

function visibleAfterColumns(items) {
  return Object.fromEntries(STAGES.map((stage) => {
    const values = items.flatMap((item) => (
      item.visibleAfterColumnsByStage?.[String(stage)]
      ?? item.visibleAfterColumnsByStage?.[stage]
      ?? []
    ));
    return [String(stage), [...new Set(values)].sort((left, right) => left - right)];
  }));
}

function sharedValue(items, key) {
  const values = [...new Set(items.map((item) => item[key]).filter(Boolean))];
  return values.length === 1 ? values[0] : null;
}

function inheritedPolicy(items) {
  const policy = {
    minimumStageByAgeBand: minimumStages(items),
    visibleByStage: visibleStages(items),
    visibleAfterColumnsByStage: visibleAfterColumns(items)
  };
  const visibilityGroup = sharedValue(items, 'visibilityGroup');
  const safetyGate = sharedValue(items, 'safetyGate');
  const semanticCategory = sharedValue(items, 'semanticCategory');
  if (visibilityGroup) policy.visibilityGroup = visibilityGroup;
  if (safetyGate) policy.safetyGate = safetyGate;
  if (semanticCategory) policy.semanticCategory = semanticCategory;
  return policy;
}

export function applyOlderRootContractPolicy(bucket) {
  const labels = OLDER_ROOT_STAGE_ONE_LABELS[bucket.column];
  if (!labels?.has(bucket.label) || bucket.parentBucketId) return bucket;

  const schoolMinimum = bucket.column === 2
    && !SCHOOL_COLUMN_TWO_STAGE_ONE_LABELS.has(bucket.label)
    ? 2
    : 1;

  return {
    ...bucket,
    minimumStageByAgeBand: {
      ...bucket.minimumStageByAgeBand,
      school_age: schoolMinimum,
      teen: 1,
      adult: 1
    },
    visibleByStage: STAGES
  };
}

function navigationWord(parent, target, label, index) {
  return {
    id: `${parent.id}-nav-${slug(target.id)}`,
    label,
    spoken: label.toLowerCase(),
    column: parent.column,
    role: target.role ?? parent.role,
    colorRole: target.colorRole ?? parent.colorRole,
    page: 1,
    slot: index + 1,
    targetBucketId: target.id,
    ...inheritedPolicy([target])
  };
}

function virtualBucket({
  id,
  label,
  symbol,
  column,
  parentBucketId,
  slot,
  children
}) {
  const role = COLUMN_ROLE[column];
  const policyChildren = children.map((child) => child.target ?? child);
  const bucket = {
    id,
    label,
    symbol,
    column,
    role,
    colorRole: role,
    page: 1,
    slot,
    wordCount: children.length,
    totalPages: 1,
    virtualBucket: true,
    ...inheritedPolicy(policyChildren),
    words: []
  };
  if (parentBucketId) bucket.parentBucketId = parentBucketId;
  bucket.words = children.map((child, index) =>
    navigationWord(bucket, child.target, child.label, index)
  );
  return bucket;
}

function cleanPartLabel(bucket, kindLabel) {
  const afterBranch = String(bucket.label ?? '').split('•').slice(1).join('•').trim();
  const withoutKind = afterBranch
    .replace(new RegExp(`^${kindLabel}\\b`, 'i'), '')
    .replace(/^[-–—:•\s]+/, '')
    .trim();
  return withoutKind || kindLabel;
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function buildBranchHierarchy(column, branch, originalBuckets, parentBucketId, slot) {
  const branchId = `axis-c${column}-branch-${slug(branch)}`;
  const role = COLUMN_ROLE[column];
  const byKind = new Map();
  for (const bucket of originalBuckets) {
    const kind = entryKind(bucket);
    if (!byKind.has(kind)) byKind.set(kind, []);
    byKind.get(kind).push(bucket);
  }

  const descendants = [];
  const branchTargets = [];
  const kindOrder = ['words', 'word', 'compounds', 'compound', 'phrases', 'phrase', 'templates', 'template', 'other'];
  const orderedKinds = [...byKind.keys()].sort(
    (left, right) => kindOrder.indexOf(left) - kindOrder.indexOf(right)
  );

  for (const kind of orderedKinds) {
    const kindLabel = ENTRY_KIND_LABELS[kind] ?? 'More';
    const ordered = [...byKind.get(kind)].sort((left, right) =>
      (left.page ?? 1) - (right.page ?? 1)
      || (left.slot ?? 1) - (right.slot ?? 1)
      || left.label.localeCompare(right.label)
    );

    if (ordered.length === 1) {
      const original = {
        ...ordered[0],
        parentBucketId: branchId,
        role: ordered[0].role ?? role,
        colorRole: ordered[0].colorRole ?? role
      };
      descendants.push(original);
      branchTargets.push({ target: original, label: kindLabel });
      continue;
    }

    const kindChunks = chunk(ordered, NAVIGATION_LIMIT);
    kindChunks.forEach((kindItems, chunkIndex) => {
      const chunkSuffix = kindChunks.length > 1 ? ` ${chunkIndex + 1}` : '';
      const kindId = `${branchId}-${slug(kindLabel)}${kindChunks.length > 1 ? `-${chunkIndex + 1}` : ''}`;
      const originals = kindItems.map((bucket) => ({
        ...bucket,
        parentBucketId: kindId,
        role: bucket.role ?? role,
        colorRole: bucket.colorRole ?? role
      }));
      const kindBucket = virtualBucket({
        id: kindId,
        label: `${kindLabel}${chunkSuffix}`,
        symbol: '▦',
        column,
        parentBucketId: branchId,
        slot: branchTargets.length + 1,
        children: originals.map((original) => ({
          target: original,
          label: cleanPartLabel(original, kindLabel)
        }))
      });
      descendants.push(kindBucket, ...originals);
      branchTargets.push({ target: kindBucket, label: kindBucket.label });
    });
  }

  const branchBucket = virtualBucket({
    id: branchId,
    label: humanizeBranch(branch),
    symbol: '📂',
    column,
    parentBucketId,
    slot,
    children: branchTargets
  });

  return { branchBucket, descendants };
}

export function buildCanonicalBucketHierarchy(columnCatalog) {
  const column = Number(columnCatalog.column);
  const originalBuckets = columnCatalog.buckets ?? [];
  const groupDefinitions = CANONICAL_BUCKET_GROUPS[column] ?? [];
  if (!groupDefinitions.length || !originalBuckets.length) return columnCatalog;

  const bucketsByBranch = new Map();
  for (const bucket of originalBuckets) {
    const branch = bucket.sourceBranch ?? 'other';
    if (!bucketsByBranch.has(branch)) bucketsByBranch.set(branch, []);
    bucketsByBranch.get(branch).push(bucket);
  }

  const configuredBranches = new Set(groupDefinitions.flatMap((group) => group.branches));
  const unassignedBranches = [...bucketsByBranch.keys()]
    .filter((branch) => !configuredBranches.has(branch))
    .sort();
  const fallbackDefinition = groupDefinitions.find((definition) => definition.fallback);
  const definitions = unassignedBranches.length && fallbackDefinition
    ? groupDefinitions.map((definition) => (
        definition === fallbackDefinition
          ? { ...definition, branches: [...definition.branches, ...unassignedBranches] }
          : definition
      ))
    : unassignedBranches.length
      ? [...groupDefinitions, { id: 'more', label: 'More', symbol: '➕', branches: unassignedBranches }]
      : groupDefinitions;

  const roots = [];
  const branches = [];
  const descendants = [];

  for (const definition of definitions) {
    const availableBranches = definition.branches.filter((branch) => bucketsByBranch.has(branch));
    if (!availableBranches.length) continue;
    const rootId = `axis-c${column}-root-${definition.id}`;
    const branchChunks = chunk(availableBranches, NAVIGATION_LIMIT);
    const builtBranches = [];
    const rootTargets = [];

    branchChunks.forEach((branchNames, chunkIndex) => {
      const sectionId = branchChunks.length > 1
        ? `${rootId}-section-${chunkIndex + 1}`
        : rootId;
      const chunkBranches = branchNames.map((branch, index) =>
        buildBranchHierarchy(
          column,
          branch,
          bucketsByBranch.get(branch),
          sectionId,
          index + 1
        )
      );
      builtBranches.push(...chunkBranches);

      if (branchChunks.length > 1) {
        const section = virtualBucket({
          id: sectionId,
          label: `${definition.label} ${chunkIndex + 1}`,
          symbol: '🗂️',
          column,
          parentBucketId: rootId,
          slot: chunkIndex + 1,
          children: chunkBranches.map(({ branchBucket }) => ({
            target: branchBucket,
            label: branchBucket.label
          }))
        });
        branches.push(section);
        rootTargets.push({ target: section, label: section.label });
      } else {
        rootTargets.push(...chunkBranches.map(({ branchBucket }) => ({
          target: branchBucket,
          label: branchBucket.label
        })));
      }
    });
    const root = applyOlderRootContractPolicy(virtualBucket({
      id: rootId,
      label: definition.label,
      symbol: definition.symbol,
      column,
      slot: roots.length + 1,
      children: rootTargets
    }));
    roots.push(root);
    for (const built of builtBranches) {
      branches.push(built.branchBucket);
      descendants.push(...built.descendants);
    }
  }

  return {
    ...columnCatalog,
    metadata: {
      ...columnCatalog.metadata,
      hierarchy: 'axis-stage-one-derived-v1',
      canonicalRootBucketCount: roots.length
    },
    buckets: [...roots, ...branches, ...descendants]
  };
}
