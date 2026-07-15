import { DEFAULT_AGE_BAND, STAGE_PATHS } from './constants.js';

export function isColumnCongruent(fromColumn, toColumn, stage) {
  const path = STAGE_PATHS[stage] ?? STAGE_PATHS[3];
  const fromIndex = path.indexOf(fromColumn);
  return fromIndex >= 0 && path[fromIndex + 1] === toColumn;
}

export function nextColumnFor(currentColumn, stage) {
  const path = STAGE_PATHS[stage] ?? STAGE_PATHS[3];
  const currentIndex = path.indexOf(currentColumn);
  if (currentIndex < 0 || currentIndex === path.length - 1) return 1;
  return path[currentIndex + 1];
}

export function itemIsCongruent(item, context) {
  const ageBand = context.ageBand ?? DEFAULT_AGE_BAND;
  const hasAgePolicy =
    item.minimumStageByAgeBand != null
    && Object.prototype.hasOwnProperty.call(item.minimumStageByAgeBand, ageBand);

  if (hasAgePolicy) {
    const minimumStage = item.minimumStageByAgeBand[ageBand];
    if (minimumStage == null) return false;
    if (context.stage < minimumStage) return false;
  } else if (!(item.visibleByStage ?? [1, 2, 3, 4]).includes(context.stage)) {
    return false;
  }

  const allowedPrevious =
    item.visibleAfterColumnsByStage?.[String(context.stage)]
    ?? item.visibleAfterColumnsByStage?.[context.stage];

  if (allowedPrevious?.length) {
    const previousColumn = context.previousToken?.column ?? 0;
    if (!allowedPrevious.includes(previousColumn)) return false;
  }

  if (item.visibleAfterColumns?.length) {
    const previousColumn = context.previousToken?.column ?? 0;
    if (!item.visibleAfterColumns.includes(previousColumn)) return false;
  }

  if (item.visibleAfterRoles?.length) {
    const previousRole = context.previousToken?.role ?? null;
    if (!item.visibleAfterRoles.includes(previousRole)) return false;
  }

  if (item.hiddenWhenPendingVerb && context.pendingVerb) return false;
  return true;
}

export function getColumnCongruenceMatrix(stage) {
  const matrix = {};
  for (let from = 1; from <= 6; from += 1) {
    matrix[from] = {};
    for (let to = 1; to <= 6; to += 1) {
      matrix[from][to] = isColumnCongruent(from, to, stage);
    }
  }
  return matrix;
}
