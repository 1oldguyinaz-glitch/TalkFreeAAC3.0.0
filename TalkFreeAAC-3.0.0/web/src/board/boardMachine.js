import { COLUMN_IDS, DEFAULT_AGE_BAND, getStageBehavior } from './constants.js';
import { nextColumnFor } from './congruence.js';

export function makeRootColumnViews() {
  return Object.fromEntries(
    COLUMN_IDS.map((column) => [column, { mode: 'buckets', bucketId: null, page: 1 }])
  );
}

export function createInitialBoardState(stage = 1, ageBand = DEFAULT_AGE_BAND) {
  return {
    stage,
    ageBand,
    activeColumn: 1,
    sentence: [],
    pendingVerb: null,
    columnViews: makeRootColumnViews(),
    lastAnnouncement: 'Column 1 is active.'
  };
}

export function isColumnInteractive(state, column) {
  const behavior = getStageBehavior(state.stage);
  return behavior.interactionMode === 'soft_guide' || state.activeColumn === column;
}

function appendToken(state, word, pending = false) {
  const token = {
    id: `${word.id}-${Date.now()}-${state.sentence.length}`,
    sourceId: word.id,
    text: word.spoken ?? word.label,
    label: word.label,
    role: word.role,
    column: word.column,
    pending
  };
  return [...state.sentence, token];
}

function restoreColumnView(columnViews, column) {
  return {
    ...columnViews,
    [column]: { mode: 'buckets', bucketId: null, page: 1 }
  };
}

function commitPendingVerbAsBase(state) {
  if (!state.pendingVerb) return state;

  return {
    ...state,
    sentence: state.sentence.map((token) =>
      token.id === state.pendingVerb.tokenId ? { ...token, pending: false } : token
    ),
    pendingVerb: null,
    columnViews: restoreColumnView(state.columnViews, 3)
  };
}

function prepareColumnInteraction(state, column) {
  if (!state.pendingVerb || column === 3) return state;
  return commitPendingVerbAsBase(state);
}

function progressionAnnouncement(label, nextColumn, stage) {
  const behavior = getStageBehavior(stage);
  if (behavior.interactionMode === 'soft_guide') {
    return `${label} added. Column ${nextColumn} is suggested; every column remains available.`;
  }
  return `${label} added. Column ${nextColumn} is active.`;
}

export function boardReducer(state, action) {
  switch (action.type) {
    case 'SET_STAGE':
      return createInitialBoardState(action.stage, state.ageBand);

    case 'SET_AGE_BAND':
      return createInitialBoardState(state.stage, action.ageBand);

    case 'OPEN_BUCKET': {
      if (!isColumnInteractive(state, action.column)) return state;
      const workingState = prepareColumnInteraction(state, action.column);
      const behavior = getStageBehavior(workingState.stage);
      return {
        ...workingState,
        activeColumn:
          behavior.interactionMode === 'soft_guide' ? action.column : workingState.activeColumn,
        columnViews: {
          ...workingState.columnViews,
          [action.column]: {
            mode: 'words',
            bucketId: action.bucketId,
            page: action.page ?? 1
          }
        },
        lastAnnouncement: `${action.bucketLabel} opened in Column ${action.column}.`
      };
    }

    case 'BACK_TO_BUCKETS': {
      if (!isColumnInteractive(state, action.column)) return state;
      const workingState = prepareColumnInteraction(state, action.column);
      const behavior = getStageBehavior(workingState.stage);
      return {
        ...workingState,
        activeColumn:
          behavior.interactionMode === 'soft_guide' ? action.column : workingState.activeColumn,
        columnViews: restoreColumnView(workingState.columnViews, action.column),
        lastAnnouncement: `Column ${action.column} categories restored.`
      };
    }

    case 'SET_PAGE': {
      if (!isColumnInteractive(state, action.column)) return state;
      const workingState = prepareColumnInteraction(state, action.column);
      return {
        ...workingState,
        columnViews: {
          ...workingState.columnViews,
          [action.column]: {
            ...workingState.columnViews[action.column],
            page: action.page
          }
        }
      };
    }

    case 'SELECT_WORD': {
      if (!isColumnInteractive(state, action.column)) return state;
      const workingState = prepareColumnInteraction(state, action.column);
      const word = action.word;
      const behavior = getStageBehavior(workingState.stage);

      if (word.column === 2 && word.grammarProfileId && behavior.useVerbGrammarOverlay) {
        const pendingSentence = appendToken(workingState, word, true);
        return {
          ...workingState,
          sentence: pendingSentence,
          pendingVerb: {
            tokenId: pendingSentence[pendingSentence.length - 1].id,
            sourceWord: word,
            grammarProfileId: word.grammarProfileId
          },
          activeColumn: 3,
          columnViews: {
            ...restoreColumnView(workingState.columnViews, 2),
            3: {
              mode: 'grammar',
              grammarProfileId: word.grammarProfileId,
              bucketId: null,
              page: 1
            }
          },
          lastAnnouncement: `${word.label} selected. Choose its grammar form in Column 3, or continue with the base form from another column.`
        };
      }

      const sentence = appendToken(workingState, word, false);
      if (word.slamShutTrigger && behavior.slamShutAfterTarget) {
        return {
          ...createInitialBoardState(workingState.stage, workingState.ageBand),
          sentence,
          lastAnnouncement: `${word.label} added. Board reset to Column 1.`
        };
      }

      const nextColumn = word.nextColumnOverride ?? nextColumnFor(word.column, workingState.stage);
      const staysInCurrentColumn = nextColumn === word.column;
      return {
        ...workingState,
        sentence,
        activeColumn: nextColumn,
        columnViews: staysInCurrentColumn
          ? workingState.columnViews
          : restoreColumnView(workingState.columnViews, word.column),
        lastAnnouncement: progressionAnnouncement(word.label, nextColumn, workingState.stage)
      };
    }

    case 'SELECT_GRAMMAR': {
      if (!state.pendingVerb || state.columnViews[3]?.mode !== 'grammar') return state;
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
      const nextColumn = nextColumnFor(3, state.stage);
      return {
        ...state,
        sentence,
        pendingVerb: null,
        activeColumn: nextColumn,
        columnViews: restoreColumnView(state.columnViews, 3),
        lastAnnouncement: progressionAnnouncement(variant.label, nextColumn, state.stage)
      };
    }

    case 'INTERRUPT': {
      if (action.interrupt.action === 'clear') {
        return createInitialBoardState(state.stage, state.ageBand);
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
      return {
        ...state,
        sentence: [...state.sentence, token],
        lastAnnouncement: `${action.interrupt.label} added.`
      };
    }

    case 'UNDO': {
      if (!state.sentence.length) return state;
      const removed = state.sentence[state.sentence.length - 1];
      const wasPending = removed.id === state.pendingVerb?.tokenId;
      return {
        ...state,
        sentence: state.sentence.slice(0, -1),
        pendingVerb: wasPending ? null : state.pendingVerb,
        activeColumn: wasPending ? 2 : state.activeColumn,
        columnViews: wasPending
          ? {
              ...restoreColumnView(state.columnViews, 2),
              3: { mode: 'buckets', bucketId: null, page: 1 }
            }
          : state.columnViews,
        lastAnnouncement: `${removed.label} removed.`
      };
    }

    case 'RESET_BOARD':
      return {
        ...createInitialBoardState(state.stage, state.ageBand),
        sentence: state.sentence
      };

    default:
      return state;
  }
}
