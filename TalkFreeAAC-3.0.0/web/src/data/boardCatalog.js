const ALL_STAGES = [1, 2, 3, 4];
const STAGES_2_PLUS = [2, 3, 4];
const STAGES_3_PLUS = [3, 4];
const STAGE_4_ONLY = [4];

function word({ id, label, column, slot, role, spoken, visibleByStage = ALL_STAGES, ...rest }) {
  return {
    id,
    label,
    spoken: spoken ?? label.toLowerCase(),
    column,
    slot,
    page: 1,
    role,
    visibleByStage,
    ...rest
  };
}

function bucket({ id, label, symbol, column, slot, words, colorRole, visibleByStage = ALL_STAGES }) {
  return {
    id,
    label,
    symbol,
    column,
    slot,
    page: 1,
    colorRole,
    visibleByStage,
    words
  };
}

export const BOARD_CATALOG = Object.freeze({
  1: {
    column: 1,
    buckets: [
      bucket({
        id: 'c1_people', label: 'People', symbol: '👤', column: 1, slot: 1, colorRole: 'person',
        words: [
          word({ id: 'i', label: 'I', column: 1, slot: 1, role: 'pronoun' }),
          word({ id: 'you', label: 'You', column: 1, slot: 2, role: 'pronoun' }),
          word({ id: 'we', label: 'We', column: 1, slot: 3, role: 'pronoun' }),
          word({ id: 'they', label: 'They', column: 1, slot: 4, role: 'pronoun', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'he', label: 'He', column: 1, slot: 5, role: 'pronoun', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'she', label: 'She', column: 1, slot: 6, role: 'pronoun', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c1_questions', label: 'Questions', symbol: '❓', column: 1, slot: 2, colorRole: 'question',
        words: [
          word({ id: 'what', label: 'What', column: 1, slot: 1, role: 'question' }),
          word({ id: 'where', label: 'Where', column: 1, slot: 2, role: 'question' }),
          word({ id: 'who', label: 'Who', column: 1, slot: 3, role: 'question' }),
          word({ id: 'when', label: 'When', column: 1, slot: 4, role: 'question', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'why', label: 'Why', column: 1, slot: 5, role: 'question', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'how', label: 'How', column: 1, slot: 6, role: 'question', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'whose', label: 'Whose', column: 1, slot: 7, role: 'question', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c1_social', label: 'Social', symbol: '💬', column: 1, slot: 3, colorRole: 'social',
        words: [
          word({ id: 'hello', label: 'Hello', column: 1, slot: 1, role: 'social' }),
          word({ id: 'please', label: 'Please', column: 1, slot: 2, role: 'social' }),
          word({ id: 'thanks', label: 'Thanks', column: 1, slot: 3, role: 'social' }),
          word({ id: 'sorry', label: 'Sorry', column: 1, slot: 4, role: 'social', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c1_demonstratives', label: 'Pointing', symbol: '☝️', column: 1, slot: 4, colorRole: 'initiator', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'this_subject', label: 'This', column: 1, slot: 1, role: 'initiator', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'that_subject', label: 'That', column: 1, slot: 2, role: 'initiator', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'these_subject', label: 'These', column: 1, slot: 3, role: 'initiator', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'those_subject', label: 'Those', column: 1, slot: 4, role: 'initiator', visibleByStage: STAGES_3_PLUS })
        ]
      })
    ]
  },
  2: {
    column: 2,
    buckets: [
      bucket({
        id: 'c2_needs', label: 'Needs', symbol: '🤲', column: 2, slot: 1, colorRole: 'verb',
        words: [
          word({ id: 'want', label: 'Want', column: 2, slot: 1, role: 'verb', grammarProfileId: 'grammar_want' }),
          word({ id: 'need', label: 'Need', column: 2, slot: 2, role: 'verb' }),
          word({ id: 'have', label: 'Have', column: 2, slot: 3, role: 'verb' }),
          word({ id: 'get', label: 'Get', column: 2, slot: 4, role: 'verb' })
        ]
      }),
      bucket({
        id: 'c2_movement', label: 'Movement', symbol: '➡️', column: 2, slot: 2, colorRole: 'verb',
        words: [
          word({ id: 'go', label: 'Go', column: 2, slot: 1, role: 'verb', grammarProfileId: 'grammar_go' }),
          word({ id: 'come', label: 'Come', column: 2, slot: 2, role: 'verb' }),
          word({ id: 'walk', label: 'Walk', column: 2, slot: 3, role: 'verb' }),
          word({ id: 'run', label: 'Run', column: 2, slot: 4, role: 'verb', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c2_body', label: 'Body Actions', symbol: '🙌', column: 2, slot: 3, colorRole: 'verb',
        words: [
          word({ id: 'eat', label: 'Eat', column: 2, slot: 1, role: 'verb', grammarProfileId: 'grammar_eat' }),
          word({ id: 'drink', label: 'Drink', column: 2, slot: 2, role: 'verb' }),
          word({ id: 'sleep', label: 'Sleep', column: 2, slot: 3, role: 'verb' }),
          word({ id: 'sit', label: 'Sit', column: 2, slot: 4, role: 'verb' })
        ]
      }),
      bucket({
        id: 'c2_create', label: 'Make / Do', symbol: '🛠️', column: 2, slot: 4, colorRole: 'verb', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'make', label: 'Make', column: 2, slot: 1, role: 'verb', grammarProfileId: 'grammar_make', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'do', label: 'Do', column: 2, slot: 2, role: 'verb', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'build', label: 'Build', column: 2, slot: 3, role: 'verb', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'draw', label: 'Draw', column: 2, slot: 4, role: 'verb', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c2_communication', label: 'Communicate', symbol: '🗣️', column: 2, slot: 5, colorRole: 'verb', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'say', label: 'Say', column: 2, slot: 1, role: 'verb', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'tell', label: 'Tell', column: 2, slot: 2, role: 'verb', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'ask', label: 'Ask', column: 2, slot: 3, role: 'verb', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'show', label: 'Show', column: 2, slot: 4, role: 'verb', visibleByStage: STAGES_2_PLUS })
        ]
      })
    ]
  },
  3: {
    column: 3,
    buckets: [
      bucket({
        id: 'c3_negation', label: 'Negation', symbol: '🚫', column: 3, slot: 1, colorRole: 'negation', visibleByStage: STAGE_4_ONLY,
        words: [
          word({ id: 'not', label: 'Not', column: 3, slot: 1, role: 'negation' }),
          word({ id: 'never', label: 'Never', column: 3, slot: 2, role: 'negation', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'dont', label: "Don't", column: 3, slot: 3, role: 'negation' }),
          word({ id: 'cant', label: "Can't", column: 3, slot: 4, role: 'negation', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c3_connections', label: 'Connections', symbol: '🔗', column: 3, slot: 2, colorRole: 'conjunction', visibleByStage: STAGE_4_ONLY,
        words: [
          word({ id: 'and', label: 'And', column: 3, slot: 1, role: 'conjunction' }),
          word({ id: 'because', label: 'Because', column: 3, slot: 2, role: 'conjunction', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'but', label: 'But', column: 3, slot: 3, role: 'conjunction', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'or', label: 'Or', column: 3, slot: 4, role: 'conjunction', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c3_direction', label: 'Direction', symbol: '🧭', column: 3, slot: 3, colorRole: 'preposition', visibleByStage: STAGE_4_ONLY,
        words: [
          word({ id: 'to', label: 'To', column: 3, slot: 1, role: 'preposition' }),
          word({ id: 'from', label: 'From', column: 3, slot: 2, role: 'preposition', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'with', label: 'With', column: 3, slot: 3, role: 'preposition' }),
          word({ id: 'without', label: 'Without', column: 3, slot: 4, role: 'preposition', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c3_location', label: 'Location', symbol: '📍', column: 3, slot: 4, colorRole: 'preposition', visibleByStage: STAGE_4_ONLY,
        words: [
          word({ id: 'in', label: 'In', column: 3, slot: 1, role: 'preposition', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'on', label: 'On', column: 3, slot: 2, role: 'preposition', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'under', label: 'Under', column: 3, slot: 3, role: 'preposition', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'beside', label: 'Beside', column: 3, slot: 4, role: 'preposition', visibleByStage: STAGES_3_PLUS })
        ]
      })
    ]
  },
  4: {
    column: 4,
    buckets: [
      bucket({
        id: 'c4_articles', label: 'Articles', symbol: '🧩', column: 4, slot: 1,
        colorRole: 'article', visibleByStage: STAGES_3_PLUS,
        words: [
          word({ id: 'a', label: 'A', column: 4, slot: 1, role: 'article', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'an', label: 'An', column: 4, slot: 2, role: 'article', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'the', label: 'The', column: 4, slot: 3, role: 'article', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c4_possessive_determiners', label: 'Ownership Before Noun', symbol: '🔐', column: 4, slot: 2,
        colorRole: 'possessive_determiner', visibleByStage: STAGES_3_PLUS,
        words: [
          word({ id: 'my', label: 'My', column: 4, slot: 1, role: 'possessive_determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'your', label: 'Your', column: 4, slot: 2, role: 'possessive_determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'his_determiner', label: 'His', column: 4, slot: 3, role: 'possessive_determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'her_determiner', label: 'Her', column: 4, slot: 4, role: 'possessive_determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'its_determiner', label: 'Its', column: 4, slot: 5, role: 'possessive_determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'our', label: 'Our', column: 4, slot: 6, role: 'possessive_determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'their', label: 'Their', column: 4, slot: 7, role: 'possessive_determiner', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c4_possessive_pronouns', label: 'Ownership Words', symbol: '🫴', column: 4, slot: 3,
        colorRole: 'possessive_pronoun', visibleByStage: STAGES_3_PLUS,
        words: [
          word({ id: 'mine', label: 'Mine', column: 4, slot: 1, role: 'possessive_pronoun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'yours', label: 'Yours', column: 4, slot: 2, role: 'possessive_pronoun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'his_pronoun', label: 'His', column: 4, slot: 3, role: 'possessive_pronoun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'hers', label: 'Hers', column: 4, slot: 4, role: 'possessive_pronoun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'ours', label: 'Ours', column: 4, slot: 5, role: 'possessive_pronoun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'theirs', label: 'Theirs', column: 4, slot: 6, role: 'possessive_pronoun', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c4_pointing', label: 'Determiners', symbol: '👉', column: 4, slot: 4,
        colorRole: 'determiner', visibleByStage: STAGES_3_PLUS,
        words: [
          word({ id: 'this', label: 'This', column: 4, slot: 1, role: 'determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'that', label: 'That', column: 4, slot: 2, role: 'determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'these', label: 'These', column: 4, slot: 3, role: 'determiner', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'those', label: 'Those', column: 4, slot: 4, role: 'determiner', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c4_quantity', label: 'Quantity', symbol: '🔢', column: 4, slot: 5,
        colorRole: 'quantity', visibleByStage: STAGES_3_PLUS,
        words: [
          word({ id: 'one', label: 'One', column: 4, slot: 1, role: 'quantity', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'some', label: 'Some', column: 4, slot: 2, role: 'quantity', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'many', label: 'Many', column: 4, slot: 3, role: 'quantity', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'all', label: 'All', column: 4, slot: 4, role: 'quantity', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c4_named_ownership', label: 'Named Ownership', symbol: '🏷️', column: 4, slot: 6,
        colorRole: 'possessive_noun', visibleByStage: STAGES_3_PLUS,
        words: [
          word({ id: 'moms', label: "Mom's", spoken: "mom's", column: 4, slot: 1, role: 'possessive_noun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'dads', label: "Dad's", spoken: "dad's", column: 4, slot: 2, role: 'possessive_noun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'friends', label: "Friend's", spoken: "friend's", column: 4, slot: 3, role: 'possessive_noun', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'teachers', label: "Teacher's", spoken: "teacher's", column: 4, slot: 4, role: 'possessive_noun', visibleByStage: STAGES_3_PLUS })
        ]
      })
    ]
  },
  5: {
    column: 5,
    buckets: [
      bucket({
        id: 'c5_emotions', label: 'Emotions', symbol: '🙂', column: 5, slot: 1, colorRole: 'emotion', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'happy', label: 'Happy', column: 5, slot: 1, role: 'emotion' }),
          word({ id: 'sad', label: 'Sad', column: 5, slot: 2, role: 'emotion' }),
          word({ id: 'mad', label: 'Mad', column: 5, slot: 3, role: 'emotion' }),
          word({ id: 'scared', label: 'Scared', column: 5, slot: 4, role: 'emotion', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c5_quality', label: 'Quality', symbol: '⭐', column: 5, slot: 2, colorRole: 'adjective', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'good', label: 'Good', column: 5, slot: 1, role: 'adjective' }),
          word({ id: 'bad', label: 'Bad', column: 5, slot: 2, role: 'adjective' }),
          word({ id: 'different', label: 'Different', column: 5, slot: 3, role: 'adjective', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'same', label: 'Same', column: 5, slot: 4, role: 'adjective', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c5_size', label: 'Size', symbol: '📏', column: 5, slot: 3, colorRole: 'adjective', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'big', label: 'Big', column: 5, slot: 1, role: 'adjective' }),
          word({ id: 'small', label: 'Small', column: 5, slot: 2, role: 'adjective' }),
          word({ id: 'long', label: 'Long', column: 5, slot: 3, role: 'adjective', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'short', label: 'Short', column: 5, slot: 4, role: 'adjective', visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c5_temperature', label: 'Temperature', symbol: '🌡️', column: 5, slot: 4, colorRole: 'adjective', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'hot', label: 'Hot', column: 5, slot: 1, role: 'adjective', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'cold', label: 'Cold', column: 5, slot: 2, role: 'adjective', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'warm', label: 'Warm', column: 5, slot: 3, role: 'adjective', visibleByStage: STAGES_3_PLUS }),
          word({ id: 'cool', label: 'Cool', column: 5, slot: 4, role: 'adjective', visibleByStage: STAGES_3_PLUS })
        ]
      }),
      bucket({
        id: 'c5_colors', label: 'Colors', symbol: '🎨', column: 5, slot: 5, colorRole: 'adjective', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'red', label: 'Red', column: 5, slot: 1, role: 'adjective', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'blue', label: 'Blue', column: 5, slot: 2, role: 'adjective', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'green', label: 'Green', column: 5, slot: 3, role: 'adjective', visibleByStage: STAGES_2_PLUS }),
          word({ id: 'yellow', label: 'Yellow', column: 5, slot: 4, role: 'adjective', visibleByStage: STAGES_2_PLUS })
        ]
      })
    ]
  },
  6: {
    column: 6,
    buckets: [
      bucket({
        id: 'c6_food', label: 'Food', symbol: '🍎', column: 6, slot: 1, colorRole: 'noun',
        words: [
          word({ id: 'apple', label: 'Apple', column: 6, slot: 1, role: 'noun', slamShutTrigger: true }),
          word({ id: 'banana', label: 'Banana', column: 6, slot: 2, role: 'noun', slamShutTrigger: true }),
          word({ id: 'pizza', label: 'Pizza', column: 6, slot: 3, role: 'noun', slamShutTrigger: true }),
          word({ id: 'sandwich', label: 'Sandwich', column: 6, slot: 4, role: 'noun', slamShutTrigger: true }),
          word({ id: 'water', label: 'Water', column: 6, slot: 5, role: 'noun', slamShutTrigger: true }),
          word({ id: 'milk', label: 'Milk', column: 6, slot: 6, role: 'noun', slamShutTrigger: true })
        ]
      }),
      bucket({
        id: 'c6_places', label: 'Places', symbol: '📍', column: 6, slot: 2, colorRole: 'place',
        words: [
          word({ id: 'home', label: 'Home', column: 6, slot: 1, role: 'noun', slamShutTrigger: true }),
          word({ id: 'school', label: 'School', column: 6, slot: 2, role: 'noun', slamShutTrigger: true }),
          word({ id: 'outside', label: 'Outside', column: 6, slot: 3, role: 'noun', slamShutTrigger: true }),
          word({ id: 'bathroom', label: 'Bathroom', column: 6, slot: 4, role: 'noun', slamShutTrigger: true }),
          word({ id: 'store', label: 'Store', column: 6, slot: 5, role: 'noun', slamShutTrigger: true, visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c6_people', label: 'People', symbol: '👥', column: 6, slot: 3, colorRole: 'noun',
        words: [
          word({ id: 'mom', label: 'Mom', column: 6, slot: 1, role: 'noun', slamShutTrigger: true }),
          word({ id: 'dad', label: 'Dad', column: 6, slot: 2, role: 'noun', slamShutTrigger: true }),
          word({ id: 'teacher', label: 'Teacher', column: 6, slot: 3, role: 'noun', slamShutTrigger: true }),
          word({ id: 'friend', label: 'Friend', column: 6, slot: 4, role: 'noun', slamShutTrigger: true }),
          word({ id: 'family', label: 'Family', column: 6, slot: 5, role: 'noun', slamShutTrigger: true, visibleByStage: STAGES_2_PLUS })
        ]
      }),
      bucket({
        id: 'c6_objects', label: 'Objects', symbol: '🧸', column: 6, slot: 4, colorRole: 'object',
        words: [
          word({ id: 'phone', label: 'Phone', column: 6, slot: 1, role: 'noun', slamShutTrigger: true }),
          word({ id: 'book', label: 'Book', column: 6, slot: 2, role: 'noun', slamShutTrigger: true }),
          word({ id: 'toy', label: 'Toy', column: 6, slot: 3, role: 'noun', slamShutTrigger: true }),
          word({ id: 'cup', label: 'Cup', column: 6, slot: 4, role: 'noun', slamShutTrigger: true }),
          word({ id: 'blanket', label: 'Blanket', column: 6, slot: 5, role: 'noun', slamShutTrigger: true })
        ]
      }),
      bucket({
        id: 'c6_activities', label: 'Activities', symbol: '🎲', column: 6, slot: 5, colorRole: 'noun', visibleByStage: STAGES_2_PLUS,
        words: [
          word({ id: 'music', label: 'Music', column: 6, slot: 1, role: 'noun', slamShutTrigger: true, visibleByStage: STAGES_2_PLUS }),
          word({ id: 'game', label: 'Game', column: 6, slot: 2, role: 'noun', slamShutTrigger: true, visibleByStage: STAGES_2_PLUS }),
          word({ id: 'movie', label: 'Movie', column: 6, slot: 3, role: 'noun', slamShutTrigger: true, visibleByStage: STAGES_2_PLUS }),
          word({ id: 'walk_activity', label: 'A Walk', spoken: 'a walk', column: 6, slot: 4, role: 'noun', slamShutTrigger: true, visibleByStage: STAGES_2_PLUS })
        ]
      })
    ]
  }
});
