const SCHOOL_AGE_POLICY = Object.freeze({
  early_childhood: null,
  school_age: 1,
  teen: null,
  adult: null
});

function word({
  id,
  label,
  column,
  slot,
  role,
  spoken = label,
  nextColumnOverride,
  slamShutTrigger = false,
  subjectAgreement,
  targetAdvanceAllowed = false
}) {
  return {
    id,
    label,
    spoken,
    column,
    page: 1,
    slot,
    role,
    colorRole: role,
    visibleByStage: [1],
    minimumStageByAgeBand: SCHOOL_AGE_POLICY,
    ...(nextColumnOverride == null ? {} : { nextColumnOverride }),
    ...(slamShutTrigger ? { slamShutTrigger: true } : {}),
    ...(subjectAgreement ? { subjectAgreement } : {}),
    ...(targetAdvanceAllowed ? { targetAdvanceAllowed: true } : {})
  };
}

function bucket({ id, label, symbol, column, slot, colorRole, words }) {
  return {
    id,
    label,
    symbol,
    column,
    page: 1,
    slot,
    colorRole,
    visibleByStage: [1],
    minimumStageByAgeBand: SCHOOL_AGE_POLICY,
    wordCount: words.length,
    totalPages: 1,
    words
  };
}

function makeWords(prefix, column, role, labels, options = {}) {
  return labels.map((entry, index) => {
    const definition = typeof entry === 'string' ? { label: entry } : entry;
    return word({
      id: `${prefix}_${String(index + 1).padStart(2, '0')}`,
      column,
      slot: index + 1,
      role,
      ...options,
      ...definition
    });
  });
}

const subjectStarter = { subjectAgreement: 'base' };
const singularSubjectStarter = { subjectAgreement: 'third_person' };

const column1Buckets = [
  bucket({
    id: 'sa_s1_c1_pronouns',
    label: 'Core Pronouns',
    symbol: '👥',
    column: 1,
    slot: 1,
    colorRole: 'pronoun',
    words: makeWords('sa_s1_c1_pronouns', 1, 'pronoun', [
      { label: 'I', ...subjectStarter },
      { label: 'you', ...subjectStarter },
      { label: 'we', ...subjectStarter },
      { label: 'he', ...singularSubjectStarter },
      { label: 'she', ...singularSubjectStarter },
      { label: 'they', ...subjectStarter },
      { label: 'it', ...singularSubjectStarter },
      { label: 'me', nextColumnOverride: 1 },
      { label: 'him', nextColumnOverride: 1 },
      { label: 'her', nextColumnOverride: 1 },
      { label: 'us', nextColumnOverride: 1 },
      { label: 'them', nextColumnOverride: 1 }
    ])
  }),
  bucket({
    id: 'sa_s1_c1_family',
    label: 'Family Starters',
    symbol: '🏠',
    column: 1,
    slot: 2,
    colorRole: 'person',
    words: makeWords('sa_s1_c1_family', 1, 'person', [
      { label: 'mom', ...singularSubjectStarter },
      { label: 'dad', ...singularSubjectStarter },
      { label: 'brother', ...singularSubjectStarter },
      { label: 'sister', ...singularSubjectStarter },
      { label: 'grandma', ...singularSubjectStarter },
      { label: 'grandpa', ...singularSubjectStarter }
    ])
  }),
  bucket({
    id: 'sa_s1_c1_people',
    label: 'School and Social People',
    symbol: '🏫',
    column: 1,
    slot: 3,
    colorRole: 'person',
    words: makeWords('sa_s1_c1_people', 1, 'person', [
      { label: 'teacher', ...singularSubjectStarter },
      { label: 'friend', ...singularSubjectStarter },
      { label: 'classmate', ...singularSubjectStarter },
      { label: 'coach', ...singularSubjectStarter },
      { label: 'therapist', ...singularSubjectStarter },
      { label: 'principal', ...singularSubjectStarter },
      { label: 'helper', ...singularSubjectStarter }
    ])
  }),
  bucket({
    id: 'sa_s1_c1_pointing',
    label: 'Possessive and Pointing',
    symbol: '☝️',
    column: 1,
    slot: 4,
    colorRole: 'possessive',
    words: makeWords('sa_s1_c1_pointing', 1, 'possessive', [
      { label: 'my', nextColumnOverride: 6 },
      { label: 'your', nextColumnOverride: 6 },
      { label: 'our', nextColumnOverride: 6 },
      { label: 'this', nextColumnOverride: 6 },
      { label: 'that', nextColumnOverride: 6 }
    ])
  }),
  bucket({
    id: 'sa_s1_c1_question_actions',
    label: 'Question Frames — Actions',
    symbol: '❓',
    column: 1,
    slot: 5,
    colorRole: 'question',
    words: makeWords('sa_s1_c1_question_actions', 1, 'question', [
      { label: 'Can I', subjectAgreement: 'question_base' },
      { label: 'Can you', subjectAgreement: 'question_base' },
      { label: 'Do you', subjectAgreement: 'question_base' },
      { label: 'Did you', subjectAgreement: 'question_base' },
      { label: 'Will you', subjectAgreement: 'question_base' },
      { label: 'What can I', subjectAgreement: 'question_base' },
      { label: 'How can I', subjectAgreement: 'question_base' },
      { label: 'Where can I', subjectAgreement: 'question_base' },
      { label: 'When can I', subjectAgreement: 'question_base' },
      { label: 'Why did you', subjectAgreement: 'question_base' },
      { label: 'Why did I', subjectAgreement: 'question_base' },
      { label: 'Who can', subjectAgreement: 'question_base' }
    ])
  }),
  bucket({
    id: 'sa_s1_c1_question_targets',
    label: 'Question Frames — Targets',
    symbol: '🔎',
    column: 1,
    slot: 6,
    colorRole: 'question',
    words: makeWords('sa_s1_c1_question_targets', 1, 'question', [
      { label: 'What is', nextColumnOverride: 6, subjectAgreement: 'question_base' },
      { label: 'Where is', nextColumnOverride: 6, subjectAgreement: 'question_base' },
      { label: 'Who is', nextColumnOverride: 6, subjectAgreement: 'question_base' },
      { label: 'When is', nextColumnOverride: 6, subjectAgreement: 'question_base' },
      { label: 'Which', nextColumnOverride: 6, subjectAgreement: 'question_base' },
      { label: 'Whose', nextColumnOverride: 6, subjectAgreement: 'question_base' }
    ])
  }),
  bucket({
    id: 'sa_s1_c1_question_words',
    label: 'Independent Questions',
    symbol: '💭',
    column: 1,
    slot: 7,
    colorRole: 'question',
    words: makeWords('sa_s1_c1_question_words', 1, 'question', [
      { label: 'Why?', nextColumnOverride: 1 },
      { label: 'What?', nextColumnOverride: 1 },
      { label: 'Where?', nextColumnOverride: 1 },
      { label: 'Who?', nextColumnOverride: 1 }
    ])
  }),
  bucket({
    id: 'sa_s1_c1_social',
    label: 'Social Starters',
    symbol: '💬',
    column: 1,
    slot: 8,
    colorRole: 'social',
    words: makeWords('sa_s1_c1_social', 1, 'social', [
      { label: 'hi', nextColumnOverride: 1 },
      { label: 'bye', nextColumnOverride: 1 },
      { label: 'please', nextColumnOverride: 1 },
      { label: 'thank you', nextColumnOverride: 1 },
      { label: 'sorry', nextColumnOverride: 1 },
      { label: 'excuse me', nextColumnOverride: 1 }
    ])
  })
];

function actionEntry(label, routing = 'target') {
  if (routing === 'continue_target') {
    return { label, nextColumnOverride: 2, targetAdvanceAllowed: true };
  }
  if (routing === 'continue') return { label, nextColumnOverride: 2 };
  if (routing === 'terminal') return { label, nextColumnOverride: 1 };
  return { label };
}

const column2Buckets = [
  bucket({
    id: 'sa_s1_c2_core',
    label: 'Core Actions',
    symbol: '⭐',
    column: 2,
    slot: 1,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_core', 2, 'verb', [
      actionEntry('want', 'continue_target'),
      actionEntry('need', 'continue_target'),
      actionEntry('have'),
      actionEntry('get'),
      actionEntry('give'),
      actionEntry('go'),
      actionEntry('come'),
      actionEntry('do'),
      actionEntry('make'),
      actionEntry('put'),
      actionEntry('take'),
      actionEntry('use'),
      actionEntry('help'),
      actionEntry('wait', 'terminal'),
      actionEntry('stop'),
      actionEntry('start')
    ])
  }),
  bucket({
    id: 'sa_s1_c2_thinking',
    label: 'Thinking and Feeling',
    symbol: '🧠',
    column: 2,
    slot: 2,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_thinking', 2, 'verb', [
      actionEntry('like', 'continue_target'),
      actionEntry('know', 'terminal'),
      actionEntry('understand', 'terminal'),
      actionEntry('remember', 'terminal'),
      actionEntry('forget', 'terminal'),
      actionEntry('think', 'terminal'),
      actionEntry('feel'),
      actionEntry('choose'),
      { ...actionEntry("can't", 'continue'), role: 'negation' },
      { ...actionEntry("don't", 'continue'), role: 'negation' }
    ])
  }),
  bucket({
    id: 'sa_s1_c2_communication',
    label: 'Communication',
    symbol: '🗣️',
    column: 2,
    slot: 3,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_communication', 2, 'verb', [
      'ask', 'answer', 'tell', 'say', 'show', 'look at', 'see', 'listen to',
      'call', 'text', 'read', 'write'
    ])
  }),
  bucket({
    id: 'sa_s1_c2_school',
    label: 'School and Learning',
    symbol: '📚',
    column: 2,
    slot: 4,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_school', 2, 'verb', [
      'learn', 'practice', 'work', 'find', 'finish', 'count', 'spell', 'draw',
      'cut', 'match', 'sort', 'check'
    ])
  }),
  bucket({
    id: 'sa_s1_c2_movement',
    label: 'Movement and Play',
    symbol: '⚽',
    column: 2,
    slot: 5,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_movement', 2, 'verb', [
      actionEntry('play'),
      actionEntry('build'),
      actionEntry('walk'),
      actionEntry('run', 'terminal'),
      actionEntry('jump', 'terminal'),
      actionEntry('climb'),
      actionEntry('sit'),
      actionEntry('stand', 'terminal'),
      actionEntry('push'),
      actionEntry('pull'),
      actionEntry('throw'),
      actionEntry('catch')
    ])
  }),
  bucket({
    id: 'sa_s1_c2_daily',
    label: 'Daily Living',
    symbol: '🧼',
    column: 2,
    slot: 6,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_daily', 2, 'verb', [
      actionEntry('eat'),
      actionEntry('drink'),
      actionEntry('wash'),
      actionEntry('brush'),
      actionEntry('dress', 'terminal'),
      actionEntry('wear'),
      actionEntry('sleep', 'terminal'),
      actionEntry('wake', 'terminal'),
      actionEntry('open'),
      actionEntry('close'),
      actionEntry('clean'),
      actionEntry('carry')
    ])
  }),
  bucket({
    id: 'sa_s1_c2_technology',
    label: 'Technology and Media',
    symbol: '💻',
    column: 2,
    slot: 7,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_technology', 2, 'verb', [
      'watch', 'type', 'save', 'delete', 'print', 'charge', 'turn on', 'turn off'
    ])
  }),
  bucket({
    id: 'sa_s1_c2_safety',
    label: 'Safety and Regulation',
    symbol: '🛟',
    column: 2,
    slot: 8,
    colorRole: 'verb',
    words: makeWords('sa_s1_c2_safety', 2, 'verb', [
      actionEntry('breathe', 'terminal'),
      actionEntry('rest', 'terminal'),
      actionEntry('leave'),
      actionEntry('stay'),
      actionEntry('pause'),
      actionEntry('resume'),
      actionEntry('try again', 'terminal'),
      actionEntry('calm down', 'terminal')
    ])
  })
];

function targetWords(prefix, labels) {
  return makeWords(prefix, 6, 'noun', labels.map((label) => ({
    label,
    slamShutTrigger: true
  })));
}

const column6Buckets = [
  bucket({
    id: 'sa_s1_c6_people',
    label: 'People and Pronoun Targets',
    symbol: '👥',
    column: 6,
    slot: 1,
    colorRole: 'noun',
    words: targetWords('sa_s1_c6_people', [
      'me', 'you', 'him', 'her', 'us', 'them', 'mom', 'dad', 'brother',
      'sister', 'grandma', 'grandpa', 'teacher', 'friend', 'classmate', 'helper'
    ])
  }),
  bucket({
    id: 'sa_s1_c6_school',
    label: 'School and Learning',
    symbol: '🎒',
    column: 6,
    slot: 2,
    colorRole: 'noun',
    words: targetWords('sa_s1_c6_school', [
      'principal', 'therapist', 'book', 'pencil', 'backpack', 'homework',
      'worksheet', 'project', 'test', 'question', 'answer', 'word', 'number',
      'math', 'reading', 'spelling'
    ])
  }),
  bucket({
    id: 'sa_s1_c6_food',
    label: 'Food and Drink',
    symbol: '🍎',
    column: 6,
    slot: 3,
    colorRole: 'noun',
    words: targetWords('sa_s1_c6_food', [
      'food', 'water', 'milk', 'juice', 'breakfast', 'lunch', 'dinner', 'snack',
      'sandwich', 'fruit', 'apple', 'banana', 'cereal', 'bread', 'pizza', 'rice'
    ])
  }),
  bucket({
    id: 'sa_s1_c6_body',
    label: 'Body Parts',
    symbol: '🖐️',
    column: 6,
    slot: 4,
    colorRole: 'noun',
    words: targetWords('sa_s1_c6_body', [
      'body', 'head', 'face', 'eyes', 'ears', 'nose', 'mouth', 'teeth', 'throat',
      'chest', 'stomach', 'back', 'arm', 'hand', 'leg', 'foot'
    ])
  }),
  bucket({
    id: 'sa_s1_c6_health',
    label: 'Health and Safety',
    symbol: '🩺',
    column: 6,
    slot: 5,
    colorRole: 'noun',
    words: targetWords('sa_s1_c6_health', [
      'doctor', 'nurse', 'pain', 'headache', 'stomachache', 'toothache',
      'medicine', 'allergy', 'asthma', 'inhaler', 'EpiPen', 'fever', 'rash',
      'emergency', 'hospital', 'safe adult'
    ])
  }),
  bucket({
    id: 'sa_s1_c6_places',
    label: 'Places and Transportation',
    symbol: '🚌',
    column: 6,
    slot: 6,
    colorRole: 'place',
    words: targetWords('sa_s1_c6_places', [
      'home', 'school', 'bathroom', 'classroom', 'playground', 'park', 'library',
      'cafeteria', 'gym', 'office', 'bus', 'car', 'school bus', 'ambulance',
      'police', 'firefighter'
    ])
  }),
  bucket({
    id: 'sa_s1_c6_home',
    label: 'Home and Personal Items',
    symbol: '🧥',
    column: 6,
    slot: 7,
    colorRole: 'noun',
    words: targetWords('sa_s1_c6_home', [
      'bed', 'door', 'table', 'chair', 'cup', 'plate', 'spoon', 'paper', 'towel',
      'soap', 'toothbrush', 'toothpaste', 'shirt', 'pants', 'shoes', 'coat'
    ])
  }),
  bucket({
    id: 'sa_s1_c6_interests',
    label: 'Play, Sports, and Technology',
    symbol: '🎮',
    column: 6,
    slot: 8,
    colorRole: 'noun',
    words: targetWords('sa_s1_c6_interests', [
      'coach', 'game', 'ball', 'puzzle', 'cards', 'music', 'video', 'art',
      'soccer', 'basketball', 'phone', 'tablet', 'computer', 'message', 'file',
      'photo'
    ])
  })
];

export const SCHOOL_AGE_STAGE_1_CATALOG = Object.freeze({
  1: Object.freeze({ column: 1, profile: 'school_age_stage_1', buckets: column1Buckets }),
  2: Object.freeze({ column: 2, profile: 'school_age_stage_1', buckets: column2Buckets }),
  3: Object.freeze({ column: 3, profile: 'school_age_stage_1', buckets: [] }),
  4: Object.freeze({ column: 4, profile: 'school_age_stage_1', buckets: [] }),
  5: Object.freeze({ column: 5, profile: 'school_age_stage_1', buckets: [] }),
  6: Object.freeze({ column: 6, profile: 'school_age_stage_1', buckets: column6Buckets })
});
