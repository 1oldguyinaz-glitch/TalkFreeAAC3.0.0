import React from 'react';

function speakSentence(text) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function SentenceBar({
  sentence,
  onUndo,
  onResetBoard,
  stageOneMode = false,
  schoolAgeStageOneMode = false
}) {
  stageOneMode = stageOneMode || schoolAgeStageOneMode;
  const text = sentence.map((token) => token.text).join(' ').trim();
  const className = stageOneMode
    ? 'sentenceBar sentenceBarStageOne'
    : 'sentenceBar';

  return (
    <section className={className} aria-label="Sentence bar">
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
          <span className="sentencePlaceholder">
            Build a sentence from left to right
          </span>
        )}
      </div>
      <div className="sentenceActions">
        <button
          type="button"
          className="sentenceActionButton speakButton"
          onClick={() => speakSentence(text)}
          disabled={!text}
        >
          Speak
        </button>
        <button
          type="button"
          className="sentenceActionButton undoButton"
          onClick={onUndo}
          disabled={!sentence.length}
        >
          Undo
        </button>
        <button
          type="button"
          className="sentenceActionButton resetPathButton"
          onClick={onResetBoard}
        >
          Reset Path
        </button>
      </div>
    </section>
  );
}
