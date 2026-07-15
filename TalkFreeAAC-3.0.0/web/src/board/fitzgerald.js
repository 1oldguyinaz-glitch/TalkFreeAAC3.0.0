const ROLE_TO_COLOR = Object.freeze({
  person: 'yellow',
  pronoun: 'yellow',
  initiator: 'yellow',

  verb: 'green',
  action: 'green',

  adjective: 'blue',
  adverb: 'blue',
  descriptor: 'blue',
  emotion: 'blue',

  noun: 'orange',
  target: 'orange',
  object: 'orange',
  place: 'orange',

  question: 'purple',

  social: 'pink',
  preposition: 'pink',

  possessive: 'gray',
  possessive_determiner: 'gray',
  possessive_pronoun: 'gray',
  possessive_noun: 'gray',
  determiner: 'gray',
  article: 'gray',
  quantity: 'gray',

  conjunction: 'white',
  negation: 'red'
});

const COLUMN_FALLBACK = Object.freeze({
  1: 'yellow',
  2: 'green',
  3: 'pink',
  4: 'gray',
  5: 'blue',
  6: 'orange'
});

export function getFitzgeraldColor(item, fallbackColumn) {
  const semanticRole = item?.colorRole ?? item?.role;
  return ROLE_TO_COLOR[semanticRole] ?? COLUMN_FALLBACK[fallbackColumn] ?? 'white';
}

export function getFitzgeraldClassName(item, fallbackColumn) {
  return `fitzgerald-${getFitzgeraldColor(item, fallbackColumn)}`;
}
