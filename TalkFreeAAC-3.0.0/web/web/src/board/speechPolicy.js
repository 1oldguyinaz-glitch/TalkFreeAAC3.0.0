export function immediateSpeechForSentenceChange(
  previousSentence = [],
  nextSentence = []
) {
  if (!Array.isArray(previousSentence) || !Array.isArray(nextSentence)) {
    return null;
  }

  if (nextSentence.length < previousSentence.length) return null;

  const previousById = new Map(
    previousSentence.map((token) => [token.id, token])
  );
  const addedTokens = nextSentence.filter(
    (token) => !previousById.has(token.id)
  );
  const addedText = addedTokens.at(-1)?.text?.trim();
  if (addedText) return addedText;

  const changedTokens = nextSentence.filter((token) => {
    const previous = previousById.get(token.id);
    return previous && (
      previous.text !== token.text
      || (previous.pending && !token.pending)
    );
  });

  return changedTokens.at(-1)?.text?.trim() || null;
}
