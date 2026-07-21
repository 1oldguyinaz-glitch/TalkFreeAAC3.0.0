import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COLUMN_DEFINITIONS } from './constants.js';
import { useBoardMachine } from './useBoardMachine.js';
import { useBoardCatalog } from '../data/useBoardCatalog.js';
import { getCatalogProfile } from '../data/profileCatalogs.js';
import { firstVisibleWordPage } from './catalogSelectors.js';
import { InterruptRow } from './InterruptRow.jsx';
import { SentenceBar } from './SentenceBar.jsx';
import { BoardColumn } from './BoardColumn.jsx';
import { BoardSettings } from './BoardSettings.jsx';
import {
  bucketRequestContextKey,
  bucketRequestIsCurrent
} from './requestGuard.js';
import {
  activeViewFocusKey,
  shouldMoveBoardFocus
} from './focusPolicy.js';

function lastLanguageToken(sentence) {
  for (let index = sentence.length - 1; index >= 0; index -= 1) {
    if ((sentence[index]?.column ?? 0) >= 1) return sentence[index];
  }
  return null;
}

export function Board() {
  const { state, actions } = useBoardMachine(1);
  const { catalog, directoriesReady, error, loadColumnWords } = useBoardCatalog();
  const [interactionError, setInteractionError] = useState('');
  const latestBucketRequestIdRef = useRef(0);
  const currentRequestContextRef = useRef('');
  const activeColumnSectionRef = useRef(null);
  const previousFocusKeyRef = useRef('');

  const profile = useMemo(
    () => getCatalogProfile(state.ageBand, state.stage),
    [state.ageBand, state.stage]
  );
  const usesDedicatedCatalog = profile.source === 'dedicated';
  const displayedCatalog = profile.catalog ?? catalog;
  const visibleColumnDefinitions = COLUMN_DEFINITIONS.filter(
    (definition) => definition.id === state.activeColumn
  );
  const requestContextKey = bucketRequestContextKey(state);
  currentRequestContextRef.current = requestContextKey;
  const focusKey = activeViewFocusKey(state);

  useEffect(() => {
    const previousFocusKey = previousFocusKeyRef.current;
    previousFocusKeyRef.current = focusKey;

    const activeElement = typeof document === 'undefined'
      ? null
      : document.activeElement;
    const dialogOwnsFocus = Boolean(activeElement?.closest?.('[aria-modal="true"]'));

    if (!shouldMoveBoardFocus(previousFocusKey, focusKey, dialogOwnsFocus)) {
      return;
    }

    const section = activeColumnSectionRef.current;
    const firstControl = section?.querySelector('button:not([disabled])');
    (firstControl ?? section)?.focus?.({ preventScroll: true });
  }, [focusKey]);

  const previousToken = lastLanguageToken(state.sentence);
  const context = useMemo(() => ({
    stage: state.stage,
    ageBand: state.ageBand,
    previousToken,
    pendingVerb: state.pendingVerb,
    sentence: state.sentence,
    contentSettings: state.contentSettings
  }), [
    state.stage,
    state.ageBand,
    previousToken,
    state.pendingVerb,
    state.sentence,
    state.contentSettings
  ]);

  const runtimeActions = useMemo(() => ({
    ...actions,
    openBucket: async (column, bucket) => {
      const requestId = latestBucketRequestIdRef.current + 1;
      latestBucketRequestIdRef.current = requestId;
      const startedContextKey = requestContextKey;

      try {
        setInteractionError('');

        if (usesDedicatedCatalog) {
          const firstPage = firstVisibleWordPage(bucket.words ?? [], context);
          actions.openBucket(column, bucket, firstPage);
          return;
        }

        const wordsPayload = await loadColumnWords(column);
        if (!bucketRequestIsCurrent({
          requestId,
          latestRequestId: latestBucketRequestIdRef.current,
          contextKey: startedContextKey,
          currentContextKey: currentRequestContextRef.current
        })) {
          return;
        }

        const firstPage = firstVisibleWordPage(
          wordsPayload.buckets?.[bucket.id] ?? [],
          context
        );
        actions.openBucket(column, bucket, firstPage);
      } catch (loadError) {
        if (bucketRequestIsCurrent({
          requestId,
          latestRequestId: latestBucketRequestIdRef.current,
          contextKey: startedContextKey,
          currentContextKey: currentRequestContextRef.current
        })) {
          setInteractionError(loadError.message);
        }
      }
    }
  }), [
    actions,
    context,
    loadColumnWords,
    requestContextKey,
    usesDedicatedCatalog
  ]);

  if (!usesDedicatedCatalog && !directoriesReady && !error) {
    return (
      <main className="boardShell boardLoading" aria-busy="true">
        <h1>TalkFreeAAC</h1>
        <p>Loading the language directories…</p>
      </main>
    );
  }

  if (!usesDedicatedCatalog && error && !directoriesReady) {
    return (
      <main className="boardShell boardError" role="alert">
        <h1>Catalog could not be loaded</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="boardShell boardShellResponsive boardShellSingleColumn">
      <SentenceBar
        sentence={state.sentence}
        singleColumnMode
      />

      <div className="boardUtilityRow boardUtilityRowStageOne">
        <InterruptRow
          onInterrupt={actions.interrupt}
          canClear={Boolean(state.backStack?.length)}
          stageOneMode={state.stage === 1}
          singleColumnMode
        />
        <BoardSettings
          stage={state.stage}
          ageBand={state.ageBand}
          contentSettings={state.contentSettings}
          onStageChange={actions.setStage}
          onAgeBandChange={actions.setAgeBand}
          onContentSettingChange={actions.setContentSetting}
        />
      </div>

      {interactionError ? (
        <p className="catalogErrorBanner" role="alert">{interactionError}</p>
      ) : null}

      <div
        className="boardViewport"
        aria-label={`Active grammatical column ${state.activeColumn}`}
      >
        <div className="sixColumnGrid singleActiveColumnGrid">
          {visibleColumnDefinitions.map((definition) => (
            <BoardColumn
              key={definition.id}
              definition={definition}
              catalog={displayedCatalog}
              view={state.columnViews[definition.id]}
              state={state}
              actions={runtimeActions}
              context={context}
              singleColumnMode
              sectionRef={activeColumnSectionRef}
            />
          ))}
        </div>
      </div>

      <p className="screenReaderStatus" aria-live="assertive">
        {state.lastAnnouncement}
      </p>
    </main>
  );
}
