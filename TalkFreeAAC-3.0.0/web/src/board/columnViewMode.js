import { COLUMN_DEFINITIONS, STAGE_PATHS } from './constants.js';

export const COLUMN_VIEW_MODES = Object.freeze({
  SINGLE: 'single',
  ALL: 'all'
});

export function visibleColumnDefinitions(mode, stage, activeColumn) {
  if (mode === COLUMN_VIEW_MODES.SINGLE) {
    return COLUMN_DEFINITIONS.filter(({ id }) => id === activeColumn);
  }

  const stagePath = new Set(STAGE_PATHS[stage] ?? STAGE_PATHS[1]);
  return COLUMN_DEFINITIONS.filter(({ id }) => stagePath.has(id));
}

export function nextColumnViewMode(mode) {
  return mode === COLUMN_VIEW_MODES.ALL
    ? COLUMN_VIEW_MODES.SINGLE
    : COLUMN_VIEW_MODES.ALL;
}

