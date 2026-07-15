import { useMemo, useReducer } from 'react';
import { boardReducer, createInitialBoardState } from './boardMachine.js';
import { DEFAULT_AGE_BAND } from './constants.js';

export function useBoardMachine(initialStage = 1, initialAgeBand = DEFAULT_AGE_BAND) {
  const [state, dispatch] = useReducer(
    boardReducer,
    { stage: initialStage, ageBand: initialAgeBand },
    ({ stage, ageBand }) => createInitialBoardState(stage, ageBand)
  );

  const actions = useMemo(() => ({
    setStage: (stage) => dispatch({ type: 'SET_STAGE', stage }),
    setAgeBand: (ageBand) => dispatch({ type: 'SET_AGE_BAND', ageBand }),
    openBucket: (column, bucket, page = 1) => dispatch({ type: 'OPEN_BUCKET', column, bucketId: bucket.id, bucketLabel: bucket.label, page }),
    backToBuckets: (column) => dispatch({ type: 'BACK_TO_BUCKETS', column }),
    setPage: (column, page) => dispatch({ type: 'SET_PAGE', column, page }),
    selectWord: (column, word) => dispatch({ type: 'SELECT_WORD', column, word }),
    advanceToTargets: () => dispatch({ type: 'ADVANCE_TO_TARGETS' }),
    selectGrammar: (variant) => dispatch({ type: 'SELECT_GRAMMAR', variant }),
    interrupt: (interrupt) => dispatch({ type: 'INTERRUPT', interrupt }),
    undo: () => dispatch({ type: 'UNDO' }),
    resetBoard: () => dispatch({ type: 'RESET_BOARD' })
  }), []);

  return { state, actions };
}
