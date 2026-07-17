import { COLUMN_IDS, DEFAULT_AGE_BAND, getStageBehavior } from './constants.js';
import { nextColumnFor } from './congruence.js';

const MAX_BACK_STACK = 100;

function rootView() {
  return { mode: 'buckets', bucketId: null, page: 1, history: [] };
}

export function makeRootColumnViews() {
  return Object.fromEntries(COLUMN_IDS.map((column) => [column, rootView()]));
}

export function createInitialBoardState(
  stage = 1,
  ageBand = DEFAULT_AGE_BAND
) {
  return {
    stage,
    ageBand,
    activeColumn: 1,
    sentence: [],
    pendingVerb: null,
    columnViews: makeRootColumnViews(),
    backStack: [],
    lastAnnouncement: 'Column 1 is active.'
  };
}

export function isColumnInteractive(state, column) {
  const behavior = getStageBehavior(state.stage);
  return behavior.interactionMode === 'soft_guide' || state.activeColumn === column;
}

function lastLanguageToken(sentence) {
  for (let index = sentence.length - 1; index >= 0; index -= 1) {
    if ((sentence[index]?.column ?? 0) >= 1) return sentence[index];
  }
  return null;
}

function thirdPersonVerb(text) {
  const [first, ...rest] = text.split(' ');
  const lower = first.toLowerCase();
  const irregular = {
    have: 'has',
    do: 'does',
    go: 'goes',
    "don't": "doesn't"
  };

  let inflected;
  if (irregular[lower]) inflected = irregular[lower];
  else if (lower === "can't") inflected = first;
  else if (/[^aeiou]y$/i.test(first)) inflected = `${first.slice(0, -1)}ies`;
  else if (/(s|sh|ch|x|z|o)$/i.test(first)) inflected = `${first}es`;
  else inflected = `${first}s`;

  return [inflected, ...rest].join(' ');
}

function spokenText(state, word) {
  const base = word.spoken ?? word.label;
  const previous = lastLanguageToken(state.sentence);

  if (word.agreeWithPreviousTarget) {
    return previous?.subjectNumber === 'plural' ? base : thirdPersonVerb(base);
  }

  if (
    state.stage !== 1
    || state.ageBand !== 'school_age'
    || word.column !== 2
  ) {
    return base;
  }

  if (previous?.column === 2) return base;
  const starter = state.sentence.find((token) => token.column === 1);
  return starter?.subjectAgreement === 'third_person'
    ? thirdPersonVerb(base)
    : base;
}

function appendToken(state, word, pending = false) {
  return [
    ...state.sentence,
    {
      id: `${word.id}-${Date.now()}-${state.sentence.length}`,
      sourceId: word.id,
      text: spokenText(state, word),
      label: word.label,
      role: word.role,
      column: word.column,
      pending,
      ...(word.subjectAgreement
        ? { subjectAgreement: word.subjectAgreement }
        : {}),
      ...(word.subjectNumber ? { subjectNumber: word.subjectNumber } : {})
    }
  ];
}

function restoreColumnView(views, column) {
  return { ...views, [column]: rootView() };
}

function commitPendingVerbAsBase(state) {
  if (!state.pendingVerb) return state;
  return {
    ...state,
    sentence: state.sentence.map((token) =>
      token.id === state.pendingVerb.tokenId
        ? { ...token, pending: false }
        : token
    ),
    pendingVerb: null,
    columnViews: restoreColumnView(state.columnViews, 3)
  };
}

function prepare(state, column) {
  return !state.pendingVerb || column === 3
    ? state
    : commitPendingVerbAsBase(state);
}

function announce(label, next, stage) {
  const behavior = getStageBehavior(stage);
  return behavior.interactionMode === 'soft_guide'
    ? `${label} added. Column ${next} is suggested; every column remains available.`
    : `${label} added. Column ${next} is active.`;
}

function historySnapshot(state) {
  return {
    activeColumn: state.activeColumn,
    sentence: state.sentence,
    pendingVerb: state.pendingVerb,
    columnViews: state.columnViews
  };
}

function withBackStep(previousState, nextState) {
  const backStack = [
    ...(previousState.backStack ?? []),
    historySnapshot(previousState)
  ].slice(-MAX_BACK_STACK);

  return { ...nextState, backStack };
}

function restorePreviousStep(state) {
  const backStack = state.backStack ?? [];
  if (!backStack.length) {
    return {
      ...state,
      lastAnnouncement: 'Nothing to clear or go back to.'
    };
  }

  const previous = backStack.at(-1);
  return {
    ...state,
    ...previous,
    backStack: backStack.slice(0, -1),
    lastAnnouncement: 'Last choice cleared. Previous board view restored.'
  };
}

function contextualNextColumn(state, word) {
  const previous = lastLanguageToken(state.sentence);
  if (!previous?.role) return null;
  return word.nextColumnAfterRoles?.[previous.role] ?? null;
}

export function boardReducer(state, action) {
  switch (action.type) {
    case 'SET_STAGE':
      return createInitialBoardState(action.stage, state.ageBand);

    case 'SET_AGE_BAND':
      return createInitialBoardState(state.stage, action.ageBand);

    case 'OPEN_BUCKET': {
      if (!isColumnInteractive(state, action.column)) return state;
      const prepared = prepare(state, action.column);
      const behavior = getStageBehavior(prepared.stage);
      const nextState = {
        ...prepared,
        activeColumn:
          behavior.interactionMode === 'soft_guide'
            ? action.column
            : prepared.activeColumn,
        columnViews: {
          ...prepared.columnViews,
          [action.column]: {
            mode: 'words',
            bucketId: action.bucketId,
            page: action.page ?? 1,
            history: []
          }
        },
        lastAnnouncement: `${action.bucketLabel} opened in Column ${action.column}.`
      };
      return withBackStep(state, nextState);
    }

    case 'OPEN_NESTED_BUCKET': {
      if (!isColumnInteractive(state, action.column)) return state;
      const prepared = prepare(state, action.column);
      const current = prepared.columnViews[action.column];
      if (current?.mode !== 'words') return state;

      const nextState = {
        ...prepared,
        columnViews: {
          ...prepared.columnViews,
          [action.column]: {
            mode: 'words',
            bucketId: action.bucketId,
            page: 1,
            history: [...(current.history ?? []), current.bucketId]
          }
        },
        lastAnnouncement: `${action.bucketLabel} opened.`
      };
      return withBackStep(state, nextState);
    }

    case 'BACK': {
      if (!isColumnInteractive(state, action.column)) return state;
      const prepared = prepare(state, action.column);
      const current = prepared.columnViews[action.column];
      const history = current?.history ?? [];

      if (current?.mode === 'words' && history.length) {
        const parent = history[history.length - 1];
        return {
          ...prepared,
          columnViews: {
            ...prepared.columnViews,
            [action.column]: {
              mode: 'words',
              bucketId: parent,
              page: 1,
              history: history.slice(0, -1)
            }
          },
          lastAnnouncement: 'Previous bucket restored.'
        };
      }

      const behavior = getStageBehavior(prepared.stage);
      return {
        ...prepared,
        activeColumn:
          behavior.interactionMode === 'soft_guide'
            ? action.column
            : prepared.activeColumn,
        columnViews: restoreColumnView(prepared.columnViews, action.column),
        lastAnnouncement: `Column ${action.column} categories restored.`
      };
    }

    case 'SET_PAGE': {
      if (!isColumnInteractive(state, action.column)) return state;
      const nextState = {
        ...state,
        columnViews: {
          ...state.columnViews,
          [action.column]: {
            ...state.columnViews[action.column],
            page: action.page
          }
        }
      };
      return withBackStep(state, nextState);
    }

    case 'SELECT_WORD': {
      if (!isColumnInteractive(state, action.column) || action.word.targetBucketId) {
        return state;
      }

      const prepared = prepare(state, action.column);
      const word = action.word;
      const behavior = getStageBehavior(prepared.stage);

      if (
        word.column === 2
        && word.grammarProfileId
        && behavior.useVerbGrammarOverlay
      ) {
        const sentence = appendToken(prepared, word, true);
        const nextState = {
          ...prepared,
          sentence,
          pendingVerb: {
            tokenId: sentence.at(-1).id,
            sourceWord: word,
            grammarProfileId: word.grammarProfileId
          },
          activeColumn: 3,
          columnViews: {
            ...restoreColumnView(prepared.columnViews, 2),
            3: {
              mode: 'grammar',
              grammarProfileId: word.grammarProfileId,
              bucketId: null,
              page: 1,
              history: []
            }
          },
          lastAnnouncement: `${word.label} selected. Choose its grammar form in Column 3.`
        };
        return withBackStep(state, nextState);
      }

      const contextualNext = contextualNextColumn(prepared, word);
      const sentence = appendToken(prepared, word, false);

      if (
        word.slamShutTrigger
        && behavior.slamShutAfterTarget
        && contextualNext == null
      ) {
        const reset = createInitialBoardState(prepared.stage, prepared.ageBand);
        return withBackStep(state, {
          ...reset,
          sentence,
          lastAnnouncement: `${word.label} added. Board reset to Column 1.`
        });
      }

      const next =
        contextualNext
        ?? word.nextColumnOverride
        ?? nextColumnFor(word.column, prepared.stage);
      const nextState = {
        ...prepared,
        sentence,
        activeColumn: next,
        columnViews:
          next === word.column
            ? prepared.columnViews
            : restoreColumnView(prepared.columnViews, word.column),
        lastAnnouncement: announce(word.label, next, prepared.stage)
      };
      return withBackStep(state, nextState);
    }

    case 'SELECT_GRAMMAR': {
      if (!state.pendingVerb || state.columnViews[3]?.mode !== 'grammar') {
        return state;
      }

      const variant = action.variant;
      const sentence = state.sentence.map((token) =>
        token.id === state.pendingVerb.tokenId
          ? {
              ...token,
              text: variant.spoken ?? variant.label,
              label: variant.label,
              pending: false,
              grammarForm: variant.form
            }
          : token
      );
      const next = nextColumnFor(3, state.stage);
      const nextState = {
        ...state,
        sentence,
        pendingVerb: null,
        activeColumn: next,
        columnViews: restoreColumnView(state.columnViews, 3),
        lastAnnouncement: announce(variant.label, next, state.stage)
      };
      return withBackStep(state, nextState);
    }

    case 'INTERRUPT': {
      if (action.interrupt.action === 'clear') {
        return restorePreviousStep(state);
      }

      const token = {
        id: `interrupt-${action.interrupt.id}-${Date.now()}`,
        sourceId: action.interrupt.id,
        text: action.interrupt.spoken,
        label: action.interrupt.label,
        role: 'interrupt',
        column: 0,
        pending: false
      };
      return withBackStep(state, {
        ...state,
        sentence: [...state.sentence, token],
        lastAnnouncement: `${action.interrupt.label} added.`
      });
    }

    case 'UNDO':
      return restorePreviousStep(state);

    case 'RESET_BOARD':
      return withBackStep(state, {
        ...createInitialBoardState(state.stage, state.ageBand),
        sentence: state.sentence
      });

    default:
      return state;
  }
}
