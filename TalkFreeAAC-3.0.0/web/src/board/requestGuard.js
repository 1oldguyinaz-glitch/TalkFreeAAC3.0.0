export function bucketRequestContextKey(state) {
  const activeView = state.columnViews?.[state.activeColumn] ?? {};
  return [
    state.ageBand,
    state.stage,
    state.activeColumn,
    activeView.mode ?? 'buckets',
    activeView.bucketId ?? '',
    activeView.page ?? 1,
    (activeView.history ?? []).join('>'),
    state.contentSettings?.showSchool ? 'school:on' : 'school:off',
    state.contentSettings?.showPrivateParts ? 'private:on' : 'private:off'
  ].join('|');
}

export function bucketRequestIsCurrent({
  requestId,
  latestRequestId,
  contextKey,
  currentContextKey
}) {
  return requestId === latestRequestId && contextKey === currentContextKey;
}
