export function activeViewFocusKey(state) {
  const view = state.columnViews?.[state.activeColumn] ?? {};
  return [
    state.activeColumn,
    view.mode ?? 'buckets',
    view.bucketId ?? '',
    view.grammarProfileId ?? '',
    view.page ?? 1
  ].join('|');
}

export function shouldMoveBoardFocus(previousKey, nextKey, dialogOwnsFocus) {
  return Boolean(previousKey && previousKey !== nextKey && !dialogOwnsFocus);
}
