import React from 'react';
import {
  COLUMN_VIEW_MODES,
  nextColumnViewMode
} from './columnViewMode.js';

export function ColumnViewToggle({ mode, onChange }) {
  const showingAll = mode === COLUMN_VIEW_MODES.ALL;
  const nextMode = nextColumnViewMode(mode);

  return (
    <button
      type="button"
      className="columnViewToggle"
      aria-pressed={showingAll}
      aria-label={showingAll
        ? 'Show one active AXIS column'
        : 'Show all AXIS columns in this stage'}
      onClick={() => onChange(nextMode)}
    >
      <span className="columnViewToggleIcon" aria-hidden="true">
        {showingAll ? '▣' : '▥'}
      </span>
      <span className="columnViewToggleCopy">
        <strong>{showingAll ? 'One Column' : 'All Columns'}</strong>
        <small>{showingAll ? 'Currently all' : 'Currently one'}</small>
      </span>
    </button>
  );
}

