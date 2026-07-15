import React from 'react';
import { getBucketPage, getWordPage } from './catalogSelectors.js';
import { FixedSlotGrid } from './FixedSlotGrid.jsx';
import { Pagination } from './Pagination.jsx';
import { GrammarOverlay } from './GrammarOverlay.jsx';
import { GRAMMAR_PROFILES } from '../data/grammarProfiles.js';
import {
  getStageBehavior,
  SINGLE_ACTIVE_COLUMN_BUCKET_SLOT_COUNT,
  SINGLE_ACTIVE_COLUMN_WORD_SLOT_COUNT
} from './constants.js';
import { getFitzgeraldClassName } from './fitzgerald.js';


function fittedSingleColumnSlotCount(items, maximumSlotCount) {
  const highestAssignedSlot = items.reduce(
    (highest, item) => Math.max(highest, item?.slot ?? 0),
    0
  );
  const roundedToFullRow = Math.ceil(Math.max(1, highestAssignedSlot) / 4) * 4;
  return Math.min(maximumSlotCount, Math.max(4, roundedToFullRow));
}

export function BoardColumn({
  definition,
  catalog,
  view,
  state,
  actions,
  context,
  singleColumnMode = false
}) {
  const column = definition.id;
  const behavior = getStageBehavior(state.stage);
  const recommended = state.activeColumn === column;
  const enabled = behavior.interactionMode === 'soft_guide' || recommended;
  const shouldDim = behavior.dimInactiveColumns && !recommended;
  const className = [
    'boardColumn',
    singleColumnMode ? 'boardColumnSingle' : '',
    singleColumnMode && view.mode === 'words' ? 'boardColumnSingleWords' : '',
    singleColumnMode && view.mode === 'buckets' ? 'boardColumnSingleBuckets' : '',
    recommended ? 'boardColumnActive' : '',
    shouldDim ? 'boardColumnDimmed' : '',
    enabled && !recommended ? 'boardColumnAvailable' : ''
  ].filter(Boolean).join(' ');

  if (view.mode === 'grammar') {
    const profile = GRAMMAR_PROFILES[view.grammarProfileId];
    return (
      <section
        className={className}
        data-column={column}
        aria-label={`Column ${column}: ${definition.label}`}
      >
        <ColumnHeader
          definition={definition}
          enabled={enabled}
          recommended={recommended}
          behavior={behavior}
        />
        <GrammarOverlay
          profile={profile}
          enabled={enabled}
          onSelect={actions.selectGrammar}
        />
      </section>
    );
  }

  if (view.mode === 'words') {
    const pageData = getWordPage(
      catalog,
      column,
      view.bucketId,
      view.page,
      context
    );
    const slotCount = singleColumnMode
      ? fittedSingleColumnSlotCount(
          pageData.items,
          SINGLE_ACTIVE_COLUMN_WORD_SLOT_COUNT
        )
      : pageData.slotCount;

    return (
      <section
        className={className}
        data-column={column}
        aria-label={`Column ${column}: ${definition.label}`}
      >
        <ColumnHeader
          definition={definition}
          enabled={enabled}
          recommended={recommended}
          behavior={behavior}
        />
        <div className="columnToolbar">
          <button
            type="button"
            className="backButton"
            disabled={!enabled}
            onClick={() => actions.backToBuckets(column)}
          >
            Categories
          </button>
          <strong>{pageData.bucket?.label ?? 'Words'}</strong>
        </div>
        <div className="columnBody columnBodyWords">
          <FixedSlotGrid
            items={pageData.items}
            slotCount={slotCount}
            fitToContainer={singleColumnMode}
            renderItem={(word) => (
              <button
                type="button"
                className={`wordButton ${word.imageSrc ? 'wordButtonPhotoTile' : ''} ${getFitzgeraldClassName(word, column)}`.trim()}
                aria-label={word.label}
                disabled={!enabled}
                onClick={() => actions.selectWord(column, word)}
              >
                {word.imageSrc ? (
                  <img
                    className="wordPhotoTile"
                    src={word.imageSrc}
                    alt=""
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    {word.symbol ? (
                      <span className="wordSymbol" aria-hidden="true">
                        {word.symbol}
                      </span>
                    ) : null}
                    <span>{word.label}</span>
                    {word.slamShutTrigger && behavior.slamShutAfterTarget ? (
                      <small>finish</small>
                    ) : null}
                  </>
                )}
              </button>
            )}
          />
          <Pagination
            page={pageData.page}
            pages={pageData.pages}
            enabled={enabled}
            onPage={(page) => actions.setPage(column, page)}
          />
        </div>
      </section>
    );
  }

  const pageData = getBucketPage(catalog, column, view.page, context);
  const slotCount = singleColumnMode
    ? fittedSingleColumnSlotCount(
        pageData.items,
        SINGLE_ACTIVE_COLUMN_BUCKET_SLOT_COUNT
      )
    : pageData.slotCount;
  const instruction = pageData.items.length
    ? 'Choose a category first'
    : (enabled ? 'No congruent categories right now' : 'Introduced in a later stage');

  return (
    <section
      className={className}
      data-column={column}
      aria-label={`Column ${column}: ${definition.label}`}
    >
      <ColumnHeader
        definition={definition}
        enabled={enabled}
        recommended={recommended}
        behavior={behavior}
      />
      {singleColumnMode ? null : (
        <div className="columnInstruction">{instruction}</div>
      )}
      <div className="columnBody columnBodyBuckets">
        <FixedSlotGrid
          items={pageData.items}
          slotCount={slotCount}
          renderItem={(bucket) => (
            <button
              type="button"
              className={`bucketButton ${bucket.imageSrc ? 'bucketButtonPhotoTile' : ''} ${getFitzgeraldClassName(bucket, column)}`.trim()}
              aria-label={bucket.label}
              disabled={!enabled}
              onClick={() => actions.openBucket(column, bucket)}
            >
              {bucket.imageSrc ? (
                <img
                  className="bucketPhotoTile"
                  src={bucket.imageSrc}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <>
                  <span className="bucketSymbol" aria-hidden="true">
                    {bucket.symbol}
                  </span>
                  <span>{bucket.label}</span>
                </>
              )}
            </button>
          )}
        />
        <Pagination
          page={pageData.page}
          pages={pageData.pages}
          enabled={enabled}
          onPage={(page) => actions.setPage(column, page)}
        />
      </div>
    </section>
  );
}

function ColumnHeader({ definition, enabled, recommended, behavior }) {
  const status = behavior.interactionMode === 'soft_guide'
    ? (recommended ? 'Suggested' : 'Available')
    : (enabled ? 'Active' : 'Waiting');

  return (
    <header className="columnHeader">
      <span className="columnNumber">{definition.id}</span>
      <div>
        <strong>{definition.shortLabel}</strong>
        <small>{definition.label}</small>
      </div>
      <span className={recommended ? 'stateBadge stateBadgeActive' : 'stateBadge'}>
        {status}
      </span>
    </header>
  );
}
