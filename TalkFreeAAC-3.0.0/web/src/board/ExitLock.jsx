import React, { useEffect, useRef, useState } from 'react';

const LONG_PRESS_MS = 1800;
const HISTORY_LOCK_STATE = 'talkfreeaac-exit-lock';

export function ExitLock({ enabled, onUnlock }) {
  const [blocked, setBlocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    function lockCurrentHistoryEntry() {
      window.history.pushState({ lock: HISTORY_LOCK_STATE }, '', window.location.href);
    }

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }

    function handlePopState() {
      setBlocked(true);
      lockCurrentHistoryEntry();
    }

    lockCurrentHistoryEntry();
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!enabled) return null;

  function startLongPress() {
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setBlocked(false);
      onUnlock();
    }, LONG_PRESS_MS);
  }

  function cancelLongPress() {
    clearTimeout(timerRef.current);
  }

  return blocked ? (
    <div className="exitLockOverlay" role="alertdialog" aria-modal="true">
      <section className="exitLockPanel">
        <p className="exitLockTitle">Exit lock is on</p>
        <p className="exitLockMessage">
          The board is locked for communication. Hold unlock to leave this page.
        </p>
        <button
          type="button"
          className="exitLockUnlockButton"
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onPointerLeave={cancelLongPress}
        >
          Hold to unlock
        </button>
      </section>
    </div>
  ) : null;
}
