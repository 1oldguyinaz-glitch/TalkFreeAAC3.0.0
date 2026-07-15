import React from 'react';

function speakSentence(text) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function SentenceBar({ sentence, onUndo, onResetBoard }) {
  const text = sentence.map((token) => token.text).join(' ').trim();

  return (
    <section className="sentenceBar" aria-label="Sentence bar">
      <div className="sentenceText" aria-live="polite">
        {sentence.length ? (
          sentence.map((token) => (
            <span
              className={token.pending ? 'sentenceToken sentenceTokenPending' : 'sentenceToken'}
              key={token.id}
            >
              {token.text}
            </span>
          ))
        ) : (
          <span className="sentencePlaceholder">Build a sentence from left to right</span>
        )}
      </div>
      <div className="sentenceActions">
        <button type="button" onClick={() => speakSentence(text)} disabled={!text}>
          Speak
        </button>
        <button type="button" onClick={onUndo} disabled={!sentence.length}>
          Undo
        </button>
        <button type="button" onClick={onResetBoard}>
          Reset path
        </button>
      </div>
    </section>
  );
}
