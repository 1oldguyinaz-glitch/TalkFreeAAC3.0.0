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
    openBucket: (column, bucket, page = 1, allowAnyColumn = false) => dispatch({
      type: 'OPEN_BUCKET',
      column,
      bucketId: bucket.id,
      bucketLabel: bucket.label,
      page,
      allowAnyColumn
    }),
    openNestedBucket: (column, item, allowAnyColumn = false) => dispatch({
      type: 'OPEN_NESTED_BUCKET',
      column,
      bucketId: item.targetBucketId,
      bucketLabel: item.label,
      allowAnyColumn
    }),
    back: (column, allowAnyColumn = false) => dispatch({
      type: 'BACK',
      column,
      allowAnyColumn
    }),
    backToBuckets: (column, allowAnyColumn = false) => dispatch({
      type: 'BACK',
      column,
      allowAnyColumn
    }),
    setPage: (column, page, allowAnyColumn = false) => dispatch({
      type: 'SET_PAGE',
      column,
      page,
      allowAnyColumn
    }),
    selectWord: (column, word, allowAnyColumn = false) => dispatch({
      type: 'SELECT_WORD',
      column,
      word,
      allowAnyColumn
    }),
    selectGrammar: (variant) => dispatch({ type: 'SELECT_GRAMMAR', variant }),
    interrupt: (interrupt) => dispatch({ type: 'INTERRUPT', interrupt }),
    undo: () => dispatch({ type: 'UNDO' }),
    resetBoard: () => dispatch({ type: 'RESET_BOARD' })
  }), []);

  return { state, actions };
}
