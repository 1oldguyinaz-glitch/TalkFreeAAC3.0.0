import React, { useEffect, useId, useRef, useState } from 'react';
import { AGE_BANDS, STAGE_DEFINITIONS } from './constants.js';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'select:not([disabled])',
  'input:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export function BoardSettings({
  stage,
  ageBand,
  contentSettings,
  onStageChange,
  onAgeBandChange,
  onContentSettingChange
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const focusableElements = () => [
      ...(panel?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
    ];
    focusableElements()[0]?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const elements = focusableElements();
      if (!elements.length) {
        event.preventDefault();
        panel?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!panel?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      (previousFocusRef.current ?? triggerRef.current)?.focus?.();
    };
  }, [open]);

  function openSettings(event) {
    previousFocusRef.current = event.currentTarget;
    setOpen(true);
  }

  return (
    <div className="boardSettings">
      <button
        ref={triggerRef}
        type="button"
        className="settingsButton"
        aria-expanded={open}
        aria-controls="board-settings-panel"
        onClick={openSettings}
      >
        Settings
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
            ref={panelRef}
            tabIndex={-1}
            id="board-settings-panel"
            className="settingsPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <header className="settingsHeader">
              <h2 id={titleId}>Settings</h2>
              <button type="button" onClick={() => setOpen(false)}>
                Close
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

            <fieldset className="contentSettingsGroup">
              <legend>Optional topics</legend>

              <label className="settingToggle">
                <input
                  type="checkbox"
                  checked={contentSettings.showSchool}
                  onChange={(event) => onContentSettingChange(
                    'showSchool',
                    event.target.checked,
                    'School topics'
                  )}
                />
                <span>
                  <strong>School topics</strong>
                  <small>Turn off at home to reduce school-related choices.</small>
                </span>
              </label>

              <label className="settingToggle">
                <input
                  type="checkbox"
                  checked={contentSettings.showPrivateParts}
                  onChange={(event) => onContentSettingChange(
                    'showPrivateParts',
                    event.target.checked,
                    'Private-parts vocabulary'
                  )}
                />
                <span>
                  <strong>Private-parts vocabulary</strong>
                  <small>Safety gate for explicit anatomy words and topics.</small>
                </span>
              </label>
            </fieldset>
          </section>
        </div>
      ) : null}
    </div>
  );
}
