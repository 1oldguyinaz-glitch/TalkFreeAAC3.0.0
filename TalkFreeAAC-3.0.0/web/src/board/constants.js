export const COLUMN_DEFINITIONS = Object.freeze([
  { id: 1, shortLabel: 'Start', label: 'Initiators / Pronouns / Questions' },
  { id: 2, shortLabel: 'Act', label: 'Core Actions / Verbs' },
  { id: 3, shortLabel: 'Modify', label: 'Modifiers / Negations / Prepositions' },
  { id: 4, shortLabel: 'Own', label: 'Possessives / Determiners' },
  { id: 5, shortLabel: 'Describe', label: 'Describers / Emotions / Adjectives' },
  { id: 6, shortLabel: 'Target', label: 'Targets / Nouns' }
]);

export const COLUMN_IDS = Object.freeze(COLUMN_DEFINITIONS.map(({ id }) => id));

export const STAGE_DEFINITIONS = Object.freeze({
  1: Object.freeze({ id: 1, label: 'Emerging Talker', path: Object.freeze([1, 2, 6]), description: 'Short, immediate messages using Start, Act, and Target.' }),
  2: Object.freeze({ id: 2, label: 'Expanding Talker', path: Object.freeze([1, 2, 5, 6]), description: 'Adds one Describe step to the guided message path.' }),
  3: Object.freeze({ id: 3, label: 'Sentence Builder', path: Object.freeze([1, 2, 4, 5, 6]), description: 'Adds ownership and determiners before description.' }),
  4: Object.freeze({ id: 4, label: 'Advanced Communicator', path: Object.freeze([1, 2, 3, 4, 5, 6]), description: 'Uses the complete six-step AXIS path and catalog.' })
});

export const STAGE_PATHS = Object.freeze(
  Object.fromEntries(Object.entries(STAGE_DEFINITIONS).map(([stage, definition]) => [stage, definition.path]))
);

export const AGE_BANDS = Object.freeze({
  early_childhood: Object.freeze({ id: 'early_childhood', label: 'Early Childhood', range: '2–5' }),
  school_age: Object.freeze({ id: 'school_age', label: 'School Age', range: '6–12' }),
  teen: Object.freeze({ id: 'teen', label: 'Teen', range: '13–17' }),
  adult: Object.freeze({ id: 'adult', label: 'Adult', range: '18+' })
});

export const DEFAULT_AGE_BAND = 'school_age';

export const STAGE_BEHAVIORS = Object.freeze({
  1: Object.freeze({ interactionMode: 'hard_gate', dimInactiveColumns: true, useVerbGrammarOverlay: false, slamShutAfterTarget: true }),
  2: Object.freeze({ interactionMode: 'hard_gate', dimInactiveColumns: true, useVerbGrammarOverlay: false, slamShutAfterTarget: true }),
  3: Object.freeze({ interactionMode: 'hard_gate', dimInactiveColumns: true, useVerbGrammarOverlay: false, slamShutAfterTarget: true }),
  4: Object.freeze({ interactionMode: 'hard_gate', dimInactiveColumns: true, useVerbGrammarOverlay: true, slamShutAfterTarget: true })
});

export function getStageBehavior(stage) {
  return STAGE_BEHAVIORS[stage] ?? STAGE_BEHAVIORS[1];
}

export const ROOT_BUCKET_SLOT_COUNT = 6;
export const WORD_SLOT_COUNT = 12;
export const SINGLE_ACTIVE_COLUMN_BUCKET_SLOT_COUNT = 16;
export const SINGLE_ACTIVE_COLUMN_WORD_SLOT_COUNT = 16;

export const DEFAULT_CONTENT_SETTINGS = Object.freeze({
  showSchool: true,
  showPrivateParts: false
});

export const INTERRUPTS = Object.freeze([
  { id: 'yes', sourceId: 'v5_25_w_0028_yes', label: 'Yes', spoken: 'yes', alwaysActive: true },
  { id: 'no', sourceId: 'v5_25_w_0029_no', label: 'No', spoken: 'no', alwaysActive: true },
  { id: 'help', sourceId: 'v5_25_w_0144_help', label: 'Help', spoken: 'help', alwaysActive: true },
  { id: 'stop', sourceId: 'v5_25_w_0092_stop', label: 'Stop', spoken: 'stop', alwaysActive: true },
  { id: 'clear', sourceId: 'v5_25_w_0955_clear', label: 'Clear', spoken: '', alwaysActive: true, action: 'clear' }
]);

export const STAGE_ONE_INTERRUPTS = Object.freeze([
  INTERRUPTS[0],
  INTERRUPTS[1],
  INTERRUPTS[2],
  {
    id: 'please',
    sourceId: 'ec_s1_quick_please',
    label: 'Please',
    spoken: 'please',
    alwaysActive: true
  },
  {
    id: 'no-thank-you',
    sourceId: 'ec_s1_quick_no_thank_you',
    label: 'No Thank You',
    spoken: 'no thank you',
    alwaysActive: true
  },
  INTERRUPTS[3],
  INTERRUPTS[4]
]);

export const EARLY_CHILDHOOD_STAGE_ONE_INTERRUPTS = STAGE_ONE_INTERRUPTS;
