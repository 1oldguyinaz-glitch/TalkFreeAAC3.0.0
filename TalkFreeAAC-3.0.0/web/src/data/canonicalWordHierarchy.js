import {
  applyOlderRootContractPolicy,
  CANONICAL_BUCKET_GROUPS
} from './catalogHierarchy.js';
import { SCHOOL_AGE_STAGE_1_CATALOG } from './schoolAgeStage1Catalog.js';
import { TEEN_STAGE_1_CATALOG } from './teenStage1Catalog.js';

const AGE_BANDS = Object.freeze([
  'early_childhood',
  'school_age',
  'teen',
  'adult'
]);
const STAGES = Object.freeze([1, 2, 3, 4]);
const NAVIGATION_LIMIT = 16;
const WORDS_PER_PAGE = 16;

const COLUMN_ROLE = Object.freeze({
  1: 'initiator',
  2: 'verb',
  3: 'preposition',
  4: 'determiner',
  5: 'descriptor',
  6: 'noun'
});

const CATEGORY_LABELS = Object.freeze({
  actions: 'Actions',
  body_health: 'Body and Health',
  communication_repair: 'Communication Repair',
  core: 'Core Words',
  descriptors: 'Descriptions',
  feelings_states: 'Feelings and States',
  food_drink: 'Food and Drink',
  needs_help: 'Needs and Help',
  objects: 'Things',
  people: 'People',
  places: 'Places',
  play_leisure: 'Play and Leisure',
  questions: 'Questions',
  safety_emergency: 'Safety and Emergency',
  school_work: 'School and Work',
  social: 'Social',
  technology_media: 'Technology and Media',
  time_routines: 'Time and Routines'
});

const ROUTE_LABELS = Object.freeze({
  activity: 'Activities',
  bathroom_care: 'Bathroom and Care',
  body_state: 'Body States',
  break_regulation: 'Breaks and Regulation',
  color_size: 'Color and Size',
  communication_repair: 'Communication Repair',
  core_words: 'Core Words',
  device_media: 'Devices and Media',
  emotion: 'Emotions',
  food_drink: 'Food and Drink',
  help_support: 'Help and Support',
  object: 'Things',
  pain: 'Pain and Body Parts',
  person: 'People',
  place: 'Places',
  question: 'Questions',
  recovery_support: 'Recovery Support',
  refusal_advocacy: 'Refusal and Advocacy',
  safety: 'Safety',
  school_work: 'School and Work',
  sick_health: 'Sickness and Health',
  social_connection: 'Social Connection',
  story_comment: 'Comments and Stories',
  temperature: 'Temperature',
  texture_sensory: 'Texture and Sensory',
  time_routine: 'Time and Routines',
  weather: 'Weather'
});

const PRONOUNS = new Set([
  'i', 'you', 'we', 'he', 'she', 'they', 'it', 'someone', 'everyone',
  'anyone', 'nobody', 'who'
]);
const POSSESSIVES = new Set([
  'my', 'your', 'our', 'his', 'her', 'their', 'mine', 'yours', 'ours',
  'hers', 'theirs', 'whose'
]);

function keyFor(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function slug(value) {
  return keyFor(value).replace(/\s+/g, '-');
}

function humanize(value) {
  return String(value ?? '')
    .replace(/_deep$/i, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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

function sharedValue(items, property) {
  const values = [...new Set(items.map((item) => item[property]).filter(Boolean))];
  return values.length === 1 ? values[0] : null;
}

function inheritedPolicy(items) {
  const policy = {
    minimumStageByAgeBand: minimumStages(items),
    visibleByStage: visibleStages(items),
    visibleAfterColumnsByStage: visibleAfterColumns(items)
  };
  for (const property of ['visibilityGroup', 'safetyGate', 'semanticCategory']) {
    const value = sharedValue(items, property);
    if (value) policy[property] = value;
  }
  return policy;
}

function rootLabels(column) {
  return new Set((CANONICAL_BUCKET_GROUPS[column] ?? []).map(({ label }) => label));
}

function referenceEntries(catalog, column) {
  const columnData = catalog[column];
  if (!columnData?.buckets?.length) return new Map();
  const byId = new Map(columnData.buckets.map((bucket) => [bucket.id, bucket]));
  const pathCache = new Map();

  function pathFor(bucket) {
    if (pathCache.has(bucket.id)) return pathCache.get(bucket.id);
    const parent = bucket.parentBucketId && byId.get(bucket.parentBucketId);
    const path = parent ? [...pathFor(parent), bucket.label] : [bucket.label];
    pathCache.set(bucket.id, path);
    return path;
  }

  const entries = new Map();
  for (const bucket of columnData.buckets) {
    const path = pathFor(bucket);
    if (!rootLabels(column).has(path[0])) continue;
    for (const word of bucket.words ?? []) {
      if (word.targetBucketId) continue;
      const key = keyFor(word.label);
      if (!entries.has(key)) entries.set(key, []);
      const signature = path.map(keyFor).join('/');
      if (!entries.get(key).some((candidate) => candidate.signature === signature)) {
        entries.get(key).push({ path, signature, word });
      }
    }
  }
  return entries;
}

const TEEN_REFERENCES = Object.freeze({
  1: referenceEntries(TEEN_STAGE_1_CATALOG, 1),
  2: referenceEntries(TEEN_STAGE_1_CATALOG, 2),
  6: referenceEntries(TEEN_STAGE_1_CATALOG, 6)
});

const SCHOOL_REFERENCES = Object.freeze({
  1: referenceEntries(SCHOOL_AGE_STAGE_1_CATALOG, 1),
  2: referenceEntries(SCHOOL_AGE_STAGE_1_CATALOG, 2),
  6: referenceEntries(SCHOOL_AGE_STAGE_1_CATALOG, 6)
});

function mergeReferenceMaps(primary, secondary) {
  const merged = new Map();
  for (const references of [primary, secondary]) {
    for (const [key, candidates] of references ?? []) {
      if (!merged.has(key)) merged.set(key, []);
      for (const candidate of candidates) {
        if (!merged.get(key).some(({ signature }) => signature === candidate.signature)) {
          merged.get(key).push(candidate);
        }
      }
    }
  }
  return merged;
}

const STAGE_ONE_REFERENCES = Object.freeze({
  1: mergeReferenceMaps(TEEN_REFERENCES[1], SCHOOL_REFERENCES[1]),
  2: mergeReferenceMaps(TEEN_REFERENCES[2], SCHOOL_REFERENCES[2]),
  6: mergeReferenceMaps(TEEN_REFERENCES[6], SCHOOL_REFERENCES[6])
});

function groupRootForSource(column, word) {
  const definitions = CANONICAL_BUCKET_GROUPS[column] ?? [];
  return definitions.find(({ branches }) => branches.includes(word.sourceBranch))?.label
    ?? definitions.find(({ fallback }) => fallback)?.label
    ?? definitions[0]?.label;
}

function fallbackRoot(column, word) {
  const labelKey = keyFor(word.label);
  const source = word.sourceBranch;
  const category = word.semanticCategory;
  const route = word.routeBucket;

  if (column === 1) {
    if (word.role === 'question' || category === 'questions' || route === 'question') return 'Questions';
    if (POSSESSIVES.has(labelKey) || String(word.role).includes('possessive')) return 'Belongs To';
    if (PRONOUNS.has(labelKey) || word.role === 'pronoun') return 'Who';
    if (category === 'people' || route === 'person') return 'People';
    return 'Phrases';
  }

  if (column === 2) {
    if (category === 'technology_media' || ['technology_media', 'digital_safety', 'accessibility_devices'].includes(source)) return 'Technology';
    if (['money_life_skills', 'work_vocational', 'community_errands', 'time_routines'].includes(source)) return 'Independence';
    if (category === 'school_work' || ['school', 'academic_deep', 'math_deep', 'reading_writing', 'science_nature'].includes(source)) return 'Learning';
    if (['communication_repair', 'social', 'social_boundaries', 'people', 'questions'].includes(source)) return 'Talking';
    if (['transportation', 'travel_navigation', 'sports_movement'].includes(source)) return 'Moving';
    if (['feelings', 'states_conditions', 'temperature', 'body_pain'].includes(source)) return 'Feelings';
    if (['behavior_support', 'regulation', 'sensory', 'therapy_goals', 'emergency', 'emergency_deep', 'safety_sensitive', 'parent_gated_safety_deep'].includes(source)) return 'Support';
    if (['food_drink', 'grocery', 'medical_deep'].includes(source) || category === 'needs_help') return 'Needs';
    if (['household', 'places', 'play', 'holidays_events', 'nature_animals', 'music_art_creativity'].includes(source)) return 'Doing';
    return 'Actions';
  }

  if (column === 6) {
    if (source === 'weather_clothing') return 'Clothes';
    if (category === 'technology_media' || ['technology_media', 'digital_safety'].includes(source)) return 'Technology';
    if (category === 'school_work' || ['school', 'academic_deep', 'math_deep', 'reading_writing', 'science_nature', 'grammar_language'].includes(source)) return 'School';
    if (category === 'food_drink' || ['food_drink', 'grocery', 'food_cooking_deep'].includes(source)) return 'Food and Drink';
    if (category === 'people' || word.role === 'person' || route === 'person') return 'People';
    if (category === 'play_leisure' || ['play', 'sports_movement', 'music_art_creativity', 'holidays_events', 'nature_animals', 'animals_deep'].includes(source)) return 'Play';
    if (category === 'places' || word.role === 'place' || ['places', 'community', 'community_errands', 'travel_navigation', 'transportation'].includes(source)) return 'Places';
    if (category === 'feelings_states' || ['feelings', 'choice_preference', 'states_conditions', 'regulation', 'behavior_support'].includes(source)) return 'Feelings';
    if (route === 'pain' || ['body_pain', 'sensory', 'temperature'].includes(source)) return 'Body Parts';
    if (category === 'body_health' || ['personal_care', 'medical_deep', 'therapy_goals', 'accessibility_devices'].includes(source)) return 'Care';
    if (['safety_emergency', 'needs_help', 'communication_repair', 'questions'].includes(category)) return 'Control';
    if (['emergency', 'emergency_deep', 'safety_sensitive', 'parent_gated_safety_deep'].includes(source)) return 'Control';
    return 'Things';
  }

  return groupRootForSource(column, word);
}

function candidateScore(candidate, word) {
  const pathKey = candidate.path.map(keyFor).join(' ');
  const routeKey = keyFor(ROUTE_LABELS[word.routeBucket] ?? humanize(word.routeBucket));
  const categoryKey = keyFor(CATEGORY_LABELS[word.semanticCategory] ?? humanize(word.semanticCategory));
  const sourceKey = keyFor(humanize(word.sourceBranch));
  return (routeKey && pathKey.includes(routeKey) ? 4 : 0)
    + (categoryKey && pathKey.includes(categoryKey) ? 2 : 0)
    + (sourceKey && pathKey.includes(sourceKey) ? 1 : 0);
}

function canonicalPath(column, word) {
  const allowedRoots = rootLabels(column);
  const root = fallbackRoot(column, word);
  const wordKey = keyFor(word.label);
  const candidates = (STAGE_ONE_REFERENCES[column]?.get(wordKey) ?? [])
    .filter((candidate) => allowedRoots.has(candidate.path[0]));
  const teenRoots = new Set(
    (TEEN_REFERENCES[column]?.get(wordKey) ?? []).map((candidate) => candidate.path[0])
  );
  const schoolRoots = new Set(
    (SCHOOL_REFERENCES[column]?.get(wordKey) ?? []).map((candidate) => candidate.path[0])
  );
  const sharedRoots = new Set(
    [...teenRoots].filter((label) => schoolRoots.has(label))
  );
  const shared = candidates.filter((candidate) => sharedRoots.has(candidate.path[0]));
  const sameRoot = candidates.filter((candidate) => candidate.path[0] === root);
  const pool = shared.length ? shared : (sameRoot.length ? sameRoot : candidates);

  if (pool.length) {
    return [...pool].sort((left, right) =>
      candidateScore(right, word) - candidateScore(left, word)
      || left.signature.localeCompare(right.signature)
    )[0].path;
  }

  const category = CATEGORY_LABELS[word.semanticCategory]
    ?? (humanize(word.semanticCategory) || 'Words');
  const route = ROUTE_LABELS[word.routeBucket]
    ?? (humanize(word.routeBucket) || 'Words');
  return [root, category, route].filter((label, index, labels) =>
    label && (index === 0 || keyFor(label) !== keyFor(labels[index - 1]))
  );
}

function referenceForPath(column, word, path) {
  const signature = path.map(keyFor).join('/');
  const candidates = STAGE_ONE_REFERENCES[column]?.get(keyFor(word.label)) ?? [];
  return candidates.find((candidate) => candidate.signature === signature)
    ?? candidates[0]
    ?? null;
}

function defaultPreviousColumns(column) {
  if (column === 1) {
    return { '1': [0, 6], '2': [0, 6], '3': [0, 6], '4': [0, 1, 2, 3, 4, 5, 6] };
  }
  if (column === 2) {
    return { '1': [1], '2': [1], '3': [1], '4': [0, 1, 2, 3, 4, 5, 6] };
  }
  if (column === 6) {
    return { '1': [2], '2': [5], '3': [5], '4': [0, 1, 2, 3, 4, 5, 6] };
  }
  return {};
}

function applyStageOneBaseline(column, word, path, reference) {
  if (!reference) return word;
  const schoolHasWord = SCHOOL_REFERENCES[column]?.has(keyFor(word.label)) ?? false;
  const originalMinimum = word.minimumStageByAgeBand ?? {};
  const schoolMinimum = schoolHasWord
    ? 1
    : Math.min(originalMinimum.school_age ?? 2, 2);

  return {
    ...reference.word,
    ...word,
    minimumStageByAgeBand: {
      early_childhood: originalMinimum.early_childhood ?? null,
      school_age: schoolMinimum,
      teen: 1,
      adult: 1
    },
    visibleByStage: STAGES,
    visibleAfterColumnsByStage: word.visibleAfterColumnsByStage
      ?? defaultPreviousColumns(column),
    canonicalStageOnePath: path
  };
}

function mergeDuplicateSourceWords(words) {
  const byLabel = new Map();
  for (const word of words) {
    const key = keyFor(word.label);
    if (!byLabel.has(key)) byLabel.set(key, []);
    byLabel.get(key).push(word);
  }

  return [...byLabel.values()].map((matches) => {
    const [canonical, ...duplicates] = matches;
    if (!duplicates.length) return canonical;
    return {
      ...canonical,
      sourceIds: matches.map((word) => word.id)
    };
  });
}

function missingStageOneAnchors(column, existingKeys) {
  const anchors = [];
  for (const [key, candidates] of STAGE_ONE_REFERENCES[column] ?? []) {
    if (existingKeys.has(key)) continue;
    const teenRoots = new Set(
      (TEEN_REFERENCES[column]?.get(key) ?? []).map((candidate) => candidate.path[0])
    );
    const schoolRoots = new Set(
      (SCHOOL_REFERENCES[column]?.get(key) ?? []).map((candidate) => candidate.path[0])
    );
    const sharedRoots = new Set(
      [...teenRoots].filter((label) => schoolRoots.has(label))
    );
    const reference = candidates.find((candidate) => sharedRoots.has(candidate.path[0]))
      ?? candidates[0];
    const word = applyStageOneBaseline(column, {
      ...reference.word,
      id: `axis-c${column}-stage-one-${slug(reference.word.label)}`,
      referenceWordId: reference.word.id,
      canonicalAnchor: true
    }, reference.path, reference);
    anchors.push({ path: reference.path, word });
  }
  return anchors;
}

function treeNode(label) {
  return { label, children: new Map(), words: [] };
}

function addWord(root, path, word) {
  let node = root;
  for (const label of path.slice(1)) {
    const key = keyFor(label);
    if (!node.children.has(key)) node.children.set(key, treeNode(label));
    node = node.children.get(key);
  }
  node.words.push(word);
}

function normalizeTree(node) {
  for (const child of node.children.values()) normalizeTree(child);

  if (node.words.length && node.children.size) {
    const general = treeNode('General');
    general.words = node.words;
    node.words = [];
    node.children.set('__general__', general);
  }

  if (node.children.size > NAVIGATION_LIMIT) {
    const children = [...node.children.values()]
      .sort((left, right) => left.label.localeCompare(right.label));
    node.children = new Map();
    for (let index = 0; index < children.length; index += NAVIGATION_LIMIT) {
      const sectionNumber = Math.floor(index / NAVIGATION_LIMIT) + 1;
      const section = treeNode(`${node.label} Group ${sectionNumber}`);
      for (const child of children.slice(index, index + NAVIGATION_LIMIT)) {
        section.children.set(keyFor(child.label), child);
      }
      node.children.set(`__group_${sectionNumber}`, section);
    }
  }
}

function allWords(node) {
  return [
    ...node.words,
    ...[...node.children.values()].flatMap((child) => allWords(child))
  ];
}

function navigationWord(parent, target, targetNode, index) {
  return {
    id: `${parent.id}-nav-${slug(target.id)}`,
    label: target.label,
    spoken: target.label.toLowerCase(),
    column: parent.column,
    role: target.role,
    colorRole: target.colorRole,
    page: 1,
    slot: index + 1,
    targetBucketId: target.id,
    ...inheritedPolicy(allWords(targetNode))
  };
}

function emitNode({ node, column, parentBucketId, id, slot, symbol, isRoot = false }) {
  const role = COLUMN_ROLE[column];
  const descendants = allWords(node);
  const childNodes = [...node.children.values()];
  let bucket = {
    id,
    label: node.label,
    symbol: symbol ?? (childNodes.length ? '📂' : '▦'),
    column,
    role,
    colorRole: role,
    page: 1,
    slot,
    wordCount: descendants.length,
    totalPages: childNodes.length
      ? 1
      : Math.max(1, Math.ceil(node.words.length / WORDS_PER_PAGE)),
    virtualBucket: true,
    ...inheritedPolicy(descendants),
    words: []
  };
  if (parentBucketId) bucket.parentBucketId = parentBucketId;
  if (isRoot) bucket = applyOlderRootContractPolicy(bucket);

  const emittedChildren = childNodes.map((child, index) => emitNode({
    node: child,
    column,
    parentBucketId: id,
    id: `${id}-${slug(child.label)}-${index + 1}`,
    slot: index + 1
  }));

  if (emittedChildren.length) {
    bucket.words = emittedChildren.map((emitted, index) =>
      navigationWord(bucket, emitted.bucket, emitted.node, index)
    );
  } else {
    bucket.words = [...node.words]
      .sort((left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id))
      .map((word, index) => ({
        ...word,
        page: Math.floor(index / WORDS_PER_PAGE) + 1,
        slot: (index % WORDS_PER_PAGE) + 1
      }));
  }

  return {
    node,
    bucket,
    descendants: emittedChildren.flatMap((emitted) => [
      emitted.bucket,
      ...emitted.descendants
    ])
  };
}

export function buildCanonicalWordHierarchy(columnCatalog, wordsPayload) {
  const column = Number(columnCatalog.column);
  const definitions = CANONICAL_BUCKET_GROUPS[column] ?? [];
  if (!definitions.length || !wordsPayload?.buckets) return columnCatalog;

  const roots = new Map(definitions.map((definition) => [
    definition.label,
    treeNode(definition.label)
  ]));
  const rawSourceWords = Object.entries(wordsPayload.buckets).flatMap(
    ([sourceBucketId, words]) => words.map((word) => ({ ...word, sourceBucketId }))
  );
  const sourceWords = mergeDuplicateSourceWords(rawSourceWords);
  const existingKeys = new Set(sourceWords.map((word) => keyFor(word.label)));
  const anchors = missingStageOneAnchors(column, existingKeys);

  for (const word of sourceWords) {
    const path = canonicalPath(column, word);
    const root = roots.get(path[0]) ?? roots.values().next().value;
    const reference = referenceForPath(column, word, path);
    const canonicalWord = applyStageOneBaseline(column, word, path, reference);
    addWord(root, [root.label, ...path.slice(1)], canonicalWord);
  }

  for (const { path, word } of anchors) {
    const root = roots.get(path[0]) ?? roots.values().next().value;
    addWord(root, [root.label, ...path.slice(1)], word);
  }

  for (const root of roots.values()) normalizeTree(root);

  const emittedRoots = definitions.map((definition, index) => emitNode({
    node: roots.get(definition.label),
    column,
    id: `axis-c${column}-root-${definition.id}`,
    slot: index + 1,
    symbol: definition.symbol,
    isRoot: true
  }));

  return {
    ...columnCatalog,
    metadata: {
      ...columnCatalog.metadata,
      hierarchy: 'axis-stage-one-word-address-v2',
      canonicalRootBucketCount: emittedRoots.length,
      sourceWordCount: rawSourceWords.length,
      deduplicatedSourceWordCount: sourceWords.length,
      stageOneAnchorCount: anchors.length,
      canonicalWordCount: sourceWords.length + anchors.length
    },
    buckets: emittedRoots.flatMap((emitted) => [
      emitted.bucket,
      ...emitted.descendants
    ])
  };
}
