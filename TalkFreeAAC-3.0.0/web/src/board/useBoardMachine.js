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
    setContentSetting: (setting, enabled, label) => dispatch({
      type: 'SET_CONTENT_SETTING',
      setting,
      enabled,
      label
    }),
    openBucket: (column, bucket, page = 1) => dispatch({ type: 'OPEN_BUCKET', column, bucketId: bucket.id, bucketLabel: bucket.label, page }),
    openNestedBucket: (column, item) => dispatch({
      type: 'OPEN_NESTED_BUCKET',
      column,
      bucketId: item.targetBucketId,
      bucketLabel: item.label
    }),
    back: (column) => dispatch({ type: 'BACK', column }),
    backToBuckets: (column) => dispatch({ type: 'BACK', column }),
    setPage: (column, page) => dispatch({ type: 'SET_PAGE', column, page }),
    selectWord: (column, word) => dispatch({ type: 'SELECT_WORD', column, word }),
    selectGrammar: (variant) => dispatch({ type: 'SELECT_GRAMMAR', variant }),
    interrupt: (interrupt) => dispatch({ type: 'INTERRUPT', interrupt }),
    undo: () => dispatch({ type: 'UNDO' }),
    resetBoard: () => dispatch({ type: 'RESET_BOARD' })
  }), []);

  return { state, actions };
}
