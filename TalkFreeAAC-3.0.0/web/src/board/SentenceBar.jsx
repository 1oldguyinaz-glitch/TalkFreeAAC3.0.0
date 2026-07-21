import React, { useEffect, useRef, useState } from 'react';
import { immediateSpeechForSentenceChange } from './speechPolicy.js';

function speakSentence(text, replaceCurrentSpeech = true) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  if (replaceCurrentSpeech) window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function SentenceBar({
  sentence,
  singleColumnMode = false,
  stageOneMode = false,
  schoolAgeStageOneMode = false
}) {
  const enhancedMode =
    singleColumnMode || stageOneMode || schoolAgeStageOneMode;
  const [speakEveryWord, setSpeakEveryWord] = useState(false);
  const previousSentenceRef = useRef(sentence);
  const text = sentence.map((token) => token.text).join(' ').trim();
  const className = enhancedMode
    ? 'sentenceBar sentenceBarStageOne'
    : 'sentenceBar';

  useEffect(() => {
    const immediateText = immediateSpeechForSentenceChange(
      previousSentenceRef.current,
      sentence
    );
    previousSentenceRef.current = sentence;

    if (speakEveryWord && immediateText) {
      speakSentence(immediateText, false);
    }
  }, [sentence, speakEveryWord]);

  return (
    <section className={className} aria-label="Sentence bar">
      <div className="sentenceText" aria-live="polite">
        {sentence.length ? (
          sentence.map((token) => (
            <span
              className={
                token.pending
                  ? 'sentenceToken sentenceTokenPending'
                  : 'sentenceToken'
              }
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
          <span className="controlButtonLabel">Speak</span>
        </button>
        <button
          type="button"
          className="sentenceActionButton everyWordButton"
          role="switch"
          aria-checked={speakEveryWord}
          aria-label={`Every Word ${speakEveryWord ? 'on' : 'off'}. Speak each selected word immediately.`}
          onClick={() => setSpeakEveryWord((enabled) => !enabled)}
        >
          <span className="everyWordSwitchTrack" aria-hidden="true">
            <span className="everyWordSwitchThumb" />
          </span>
          <span className="everyWordCopy">
            <span className="controlButtonLabel">Every Word</span>
            <small aria-hidden="true">{speakEveryWord ? 'On' : 'Off'}</small>
          </span>
        </button>
      </div>
    </section>
  );
}
