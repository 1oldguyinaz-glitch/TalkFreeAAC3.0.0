import React from 'react';
import { FixedSlotGrid } from './FixedSlotGrid.jsx';
import { WORD_SLOT_COUNT } from './constants.js';

export function GrammarOverlay({ profile, enabled, onSelect }) {
  return (
    <div className="columnBody grammarBody">
      <div className="columnInstruction">Choose a form, or continue elsewhere to keep the base verb.</div>
      <FixedSlotGrid
        items={profile?.variants ?? []}
        slotCount={WORD_SLOT_COUNT}
        fitToContainer
        renderItem={(variant) => (
          <button
            type="button"
            className="wordButton grammarButton fitzgerald-green"
            disabled={!enabled}
            onClick={() => onSelect(variant)}
          >
            <span>{variant.label}</span>
            <small>{variant.form.replaceAll('_', ' ')}</small>
          </button>
        )}
      />
    </div>
  );
}
