import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useBoardMachine } from './useBoardMachine.js';
import { useBoardCatalog } from '../data/useBoardCatalog.js';
import { getCatalogProfile } from '../data/profileCatalogs.js';
import { firstVisibleWordPage } from './catalogSelectors.js';
import { InterruptRow } from './InterruptRow.jsx';
import { SentenceBar } from './SentenceBar.jsx';
import { BoardColumn } from './BoardColumn.jsx';
import { BoardSettings } from './BoardSettings.jsx';
import { ColumnViewToggle } from './ColumnViewToggle.jsx';
import { ExitLock } from './ExitLock.jsx';
import {
  COLUMN_VIEW_MODES,
  visibleColumnDefinitions
} from './columnViewMode.js';
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
  const [columnViewMode, setColumnViewMode] = useState(COLUMN_VIEW_MODES.SINGLE);
  const [exitLockEnabled, setExitLockEnabled] = useState(false);
  const [boardScrollState, setBoardScrollState] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false
  });
  const latestBucketRequestIdRef = useRef(0);
  const currentRequestContextRef = useRef('');
  const activeColumnSectionRef = useRef(null);
  const boardViewportRef = useRef(null);
  const previousFocusKeyRef = useRef('');

  const profile = useMemo(
    () => getCatalogProfile(state.ageBand, state.stage),
    [state.ageBand, state.stage]
  );
  const usesDedicatedCatalog = profile.source === 'dedicated';
  const displayedCatalog = profile.catalog ?? catalog;
  const singleColumnMode = columnViewMode === COLUMN_VIEW_MODES.SINGLE;
  const allowAnyVisibleColumn = !singleColumnMode;
  const displayedColumnDefinitions = visibleColumnDefinitions(
    columnViewMode,
    state.stage,
    state.activeColumn
  );
  const requestContextKey = `${
    bucketRequestContextKey(state)
  }|view:${columnViewMode}`;
  currentRequestContextRef.current = requestContextKey;
  const focusKey = activeViewFocusKey(state);

  const updateBoardScrollState = useCallback(() => {
    const viewport = boardViewportRef.current;
    if (!viewport) return;

    const maximumScrollLeft = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth
    );
    const edgeTolerance = 2;
    setBoardScrollState({
      hasOverflow: maximumScrollLeft > edgeTolerance,
      canScrollLeft: viewport.scrollLeft > edgeTolerance,
      canScrollRight:
        viewport.scrollLeft < maximumScrollLeft - edgeTolerance
    });
  }, []);

  const scrollBoard = useCallback((direction) => {
    const viewport = boardViewportRef.current;
    if (!viewport) return;

    const prefersReducedMotion =
      typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollBy({
      left: direction * Math.max(304, viewport.clientWidth * 0.82),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, []);

  useEffect(() => {
    const viewport = boardViewportRef.current;
    if (!viewport) return undefined;

    viewport.scrollLeft = 0;
    const animationFrame = window.requestAnimationFrame(updateBoardScrollState);
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updateBoardScrollState);
    resizeObserver?.observe(viewport);
    const grid = viewport.firstElementChild;
    if (grid) resizeObserver?.observe(grid);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
    };
  }, [
    columnViewMode,
    displayedColumnDefinitions.length,
    state.stage,
    updateBoardScrollState
  ]);

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
    allowAnyColumn: allowAnyVisibleColumn,
    previousToken,
    pendingVerb: state.pendingVerb,
    sentence: state.sentence,
    contentSettings: state.contentSettings
  }), [
    state.stage,
    state.ageBand,
    allowAnyVisibleColumn,
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
          actions.openBucket(
            column,
            bucket,
            firstPage,
            allowAnyVisibleColumn
          );
          return;
        }

        const loadedColumn = await loadColumnWords(column);
        if (!bucketRequestIsCurrent({
          requestId,
          latestRequestId: latestBucketRequestIdRef.current,
          contextKey: startedContextKey,
          currentContextKey: currentRequestContextRef.current
        })) {
          return;
        }

        const refreshedBucket = loadedColumn.columnCatalog.buckets.find(
          (candidate) => candidate.id === bucket.id
        ) ?? bucket;
        const firstPage = firstVisibleWordPage(refreshedBucket.words ?? [], context);
        actions.openBucket(
          column,
          refreshedBucket,
          firstPage,
          allowAnyVisibleColumn
        );
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
    },
    openNestedBucket: (column, item) => actions.openNestedBucket(
      column,
      item,
      allowAnyVisibleColumn
    ),
    back: (column) => actions.back(column, allowAnyVisibleColumn),
    backToBuckets: (column) => actions.backToBuckets(
      column,
      allowAnyVisibleColumn
    ),
    setPage: (column, page) => actions.setPage(
      column,
      page,
      allowAnyVisibleColumn
    ),
    selectWord: (column, word) => actions.selectWord(
      column,
      word,
      allowAnyVisibleColumn
    )
  }), [
    actions,
    allowAnyVisibleColumn,
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
    <main className={[
      'boardShell',
      'boardShellResponsive',
      'boardShellReferenceTheme',
      singleColumnMode ? 'boardShellSingleColumn' : 'boardShellAllColumns'
    ].join(' ')}>
      <header className="boardChromeHeader">
        <div className="boardBrand" aria-label="TalkFreeAAC">
          <strong className="boardBrandName">
            <span>TalkFree</span><span>AAC</span>
          </strong>
          <small className="boardBrandTagline">Connection is the outcome.</small>
        </div>
        <div className="boardViewControls">
          <ColumnViewToggle
            mode={columnViewMode}
            onChange={setColumnViewMode}
          />
          <BoardSettings
            stage={state.stage}
            ageBand={state.ageBand}
            contentSettings={state.contentSettings}
            exitLockEnabled={exitLockEnabled}
            onStageChange={actions.setStage}
            onAgeBandChange={actions.setAgeBand}
            onContentSettingChange={actions.setContentSetting}
            onExitLockChange={setExitLockEnabled}
          />
        </div>
      </header>

      {interactionError ? (
        <p className="catalogErrorBanner" role="alert">{interactionError}</p>
      ) : null}

      {!singleColumnMode && boardScrollState.hasOverflow ? (
        <nav
          className="boardScrollControls"
          aria-label="Advanced All Columns navigation"
        >
          <button
            type="button"
            aria-controls="axis-columns-viewport"
            disabled={!boardScrollState.canScrollLeft}
            onClick={() => scrollBoard(-1)}
          >
            <span aria-hidden="true">←</span>
            <span>Earlier columns</span>
          </button>
          <p aria-live="polite">
            All choices stay full-size and clickable. Swipe the board or use the arrows.
          </p>
          <button
            type="button"
            aria-controls="axis-columns-viewport"
            disabled={!boardScrollState.canScrollRight}
            onClick={() => scrollBoard(1)}
          >
            <span>Later columns</span>
            <span aria-hidden="true">→</span>
          </button>
        </nav>
      ) : null}

      <div
        id="axis-columns-viewport"
        ref={boardViewportRef}
        className="boardViewport"
        onScroll={updateBoardScrollState}
        tabIndex={!singleColumnMode && boardScrollState.hasOverflow ? 0 : undefined}
        aria-label={singleColumnMode
          ? `Active grammatical column ${state.activeColumn}`
          : `All ${displayedColumnDefinitions.length} AXIS columns for Stage ${state.stage}`}
      >
        <div
          className={singleColumnMode
            ? 'sixColumnGrid singleActiveColumnGrid'
            : 'sixColumnGrid stageColumnsGrid'}
          style={singleColumnMode
            ? undefined
            : { '--visible-columns': displayedColumnDefinitions.length }}
        >
          {displayedColumnDefinitions.map((definition) => (
            <BoardColumn
              key={definition.id}
              definition={definition}
              catalog={displayedCatalog}
              view={state.columnViews[definition.id]}
              state={state}
              actions={runtimeActions}
              context={context}
              singleColumnMode={singleColumnMode}
              sectionRef={definition.id === state.activeColumn
                ? activeColumnSectionRef
                : null}
            />
          ))}
        </div>
      </div>

      <footer className="boardCommunicationDock boardUtilityRowStageOne">
        <SentenceBar
          sentence={state.sentence}
          singleColumnMode={singleColumnMode}
          stageOneMode={state.stage === 1}
        />
        <InterruptRow
          onInterrupt={actions.interrupt}
          canClear={Boolean(state.backStack?.length)}
          stageOneMode={state.stage === 1}
          singleColumnMode={singleColumnMode}
        />
      </footer>

      <p className="screenReaderStatus" aria-live="assertive">
        {state.lastAnnouncement}
      </p>

      <ExitLock
        enabled={exitLockEnabled}
        onUnlock={() => setExitLockEnabled(false)}
      />
    </main>
  );
}
