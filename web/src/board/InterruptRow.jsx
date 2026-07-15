import React from 'react';
import {
  EARLY_CHILDHOOD_STAGE_ONE_INTERRUPTS,
  INTERRUPTS
} from './constants.js';

export function InterruptRow({ onInterrupt, stageOneMode = false }) {
  const controls = stageOneMode
    ? EARLY_CHILDHOOD_STAGE_ONE_INTERRUPTS
    : INTERRUPTS;
  const className = stageOneMode
    ? 'interruptRow interruptRowStageOne'
    : 'interruptRow';

  return (
    <nav className={className} aria-label="Always available communication controls">
      {controls.map((interrupt) => (
        <button
          type="button"
          className={`interruptButton interrupt-${interrupt.id}`}
          key={interrupt.id}
          onClick={() => onInterrupt(interrupt)}
          data-always-active="true"
        >
          {interrupt.label}
        </button>
      ))}
    </nav>
  );
}
