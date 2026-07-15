import React from 'react';
import { INTERRUPTS } from './constants.js';

export function InterruptRow({ onInterrupt }) {
  return (
    <nav className="interruptRow" aria-label="Always available communication controls">
      {INTERRUPTS.map((interrupt) => (
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
