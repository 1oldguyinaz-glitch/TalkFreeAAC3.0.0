import React, { useMemo, useState } from 'react';
import { COLUMN_DEFINITIONS } from './constants.js';
import { useBoardMachine } from './useBoardMachine.js';
import { useBoardCatalog } from '../data/useBoardCatalog.js';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from '../data/earlyChildhoodStage1Catalog.js';
import { SCHOOL_AGE_STAGE_1_CATALOG } from '../data/schoolAgeStage1Catalog.js';
import { firstVisibleWordPage } from './catalogSelectors.js';
import { InterruptRow } from './InterruptRow.jsx';
import { SentenceBar } from './SentenceBar.jsx';
import { BoardColumn } from './BoardColumn.jsx';
import { BoardSettings } from './BoardSettings.jsx';

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

  const usesEarlyChildhoodStageOne =
    state.ageBand === 'early_childhood' && state.stage === 1;
  const usesSchoolAgeStageOne =
    state.ageBand === 'school_age' && state.stage === 1;
  const usesSingleColumnStageOne =
    usesEarlyChildhoodStageOne || usesSchoolAgeStageOne;

  const displayedCatalog = usesEarlyChildhoodStageOne
    ? EARLY_CHILDHOOD_STAGE_1_CATALOG
    : usesSchoolAgeStageOne
      ? SCHOOL_AGE_STAGE_1_CATALOG
      : catalog;

  const visibleColumnDefinitions = usesSingleColumnStageOne
    ? COLUMN_DEFINITIONS.filter(
        (definition) => definition.id === state.activeColumn
      )
    : COLUMN_DEFINITIONS;

  const previousToken = lastLanguageToken(state.sentence);
  const context = useMemo(() => ({
    stage: state.stage,
    ageBand: state.ageBand,
    previousToken,
    pendingVerb: state.pendingVerb,
    sentence: state.sentence
  }), [state.stage, state.ageBand, previousToken, state.pendingVerb, state.sentence]);

  const runtimeActions = useMemo(() => ({
    ...actions,
    openBucket: async (column, bucket) => {
      try {
        setInteractionError('');

        if (usesSingleColumnStageOne) {
          const firstPage = firstVisibleWordPage(bucket.words ?? [], context);
          actions.openBucket(column, bucket, firstPage);
          return;
        }

        const wordsPayload = await loadColumnWords(column);
        const firstPage = firstVisibleWordPage(
          wordsPayload.buckets?.[bucket.id] ?? [],
          context
        );
        actions.openBucket(column, bucket, firstPage);
      } catch (loadError) {
        setInteractionError(loadError.message);
      }
    }
  }), [actions, context, loadColumnWords, usesSingleColumnStageOne]);

  if (!usesSingleColumnStageOne && !directoriesReady && !error) {
    return (
      <main className="boardShell boardLoading" aria-busy="true">
        <h1>TalkFreeAAC</h1>
        <p>Loading the language directories…</p>
      </main>
    );
  }

  if (!usesSingleColumnStageOne && error && !directoriesReady) {
    return (
      <main className="boardShell boardError" role="alert">
        <h1>Catalog could not be loaded</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main
      className={
        usesSingleColumnStageOne
          ? 'boardShell boardShellSingleColumn'
          : 'boardShell'
      }
    >
      <SentenceBar
        sentence={state.sentence}
        onUndo={actions.undo}
        onResetBoard={actions.resetBoard}
        stageOneMode={usesEarlyChildhoodStageOne}
        schoolAgeStageOneMode={usesSchoolAgeStageOne}
      />

      <div
        className={
          usesSingleColumnStageOne
            ? 'boardUtilityRow boardUtilityRowStageOne'
            : 'boardUtilityRow'
        }
      >
        <InterruptRow
          onInterrupt={actions.interrupt}
          stageOneMode={usesEarlyChildhoodStageOne}
        schoolAgeStageOneMode={usesSchoolAgeStageOne}
        />
        <BoardSettings
          stage={state.stage}
          ageBand={state.ageBand}
          onStageChange={actions.setStage}
          onAgeBandChange={actions.setAgeBand}
        />
      </div>

      {interactionError ? (
        <p className="catalogErrorBanner" role="alert">{interactionError}</p>
      ) : null}

      <div
        className="boardViewport"
        aria-label={
          usesSingleColumnStageOne
            ? `Active grammatical column ${state.activeColumn}`
            : 'Six-column grammatical board'
        }
      >
        <div
          className={
            usesSingleColumnStageOne
              ? 'sixColumnGrid singleActiveColumnGrid'
              : 'sixColumnGrid'
          }
        >
          {visibleColumnDefinitions.map((definition) => (
            <BoardColumn
              key={definition.id}
              definition={definition}
              catalog={displayedCatalog}
              view={state.columnViews[definition.id]}
              state={state}
              actions={runtimeActions}
              context={context}
              singleColumnMode={usesEarlyChildhoodStageOne}
              schoolAgeSingleColumnMode={usesSchoolAgeStageOne}
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
