import React, { useId, useState } from 'react';
import { AGE_BANDS, STAGE_DEFINITIONS } from './constants.js';

export function BoardSettings({
  stage,
  ageBand,
  onStageChange,
  onAgeBandChange
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <div className="boardSettings">
      <button
        type="button"
        className="settingsButton"
        aria-expanded={open}
        aria-controls="board-settings-panel"
        onClick={() => setOpen(true)}
      >
        <span className="controlButtonLabel">Settings</span>
      </button>

      {open ? (
        <div
          className="settingsOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            id="board-settings-panel"
            className="settingsPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <header className="settingsHeader">
              <h2 id={titleId}>Settings</h2>
              <button
                type="button"
                className="settingsCloseButton"
                onClick={() => setOpen(false)}
              >
                <span className="controlButtonLabel">Close</span>
              </button>
            </header>

            <label className="stageControl">
              <span>Communication stage</span>
              <select
                value={stage}
                onChange={(event) => onStageChange(Number(event.target.value))}
              >
                {Object.values(STAGE_DEFINITIONS).map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    Stage {definition.id}: {definition.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="stageControl">
              <span>Age band</span>
              <select
                value={ageBand}
                onChange={(event) => onAgeBandChange(event.target.value)}
              >
                {Object.values(AGE_BANDS).map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label} ({band.range})
                  </option>
                ))}
              </select>
            </label>
          </section>
        </div>
      ) : null}
    </div>
  );
}
