import React from 'react';
import {
  STAGE_ONE_INTERRUPTS,
  INTERRUPTS
} from './constants.js';

export function InterruptRow({
  onInterrupt,
  canClear = false,
  stageOneMode = false,
  schoolAgeStageOneMode = false
}) {
  stageOneMode = stageOneMode || schoolAgeStageOneMode;
  const controls = stageOneMode ? STAGE_ONE_INTERRUPTS : INTERRUPTS;
  const className = stageOneMode
    ? 'interruptRow interruptRowStageOne'
    : 'interruptRow';

  return (
    <nav className={className} aria-label="Always available communication controls">
      {controls.map((interrupt) => {
        const isClear = interrupt.action === 'clear';
        return (
          <button
            type="button"
            className={`interruptButton interrupt-${interrupt.id}`}
            key={interrupt.id}
            onClick={() => onInterrupt(interrupt)}
            data-always-active="true"
            disabled={isClear && !canClear}
            aria-label={
              isClear
                ? 'Clear the last choice and return to the previous board view'
                : interrupt.label
            }
          >
            <span className="controlButtonLabel">{interrupt.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
