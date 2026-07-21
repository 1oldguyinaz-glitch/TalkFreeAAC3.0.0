import { readFile, writeFile } from 'node:fs/promises';

const catalogPath = new URL(
  '../public/catalog/columns/column1.words.json',
  import.meta.url
);

const replacements = new Map([
  ['v5_27_p_01586_i_need_help_with_circle_time', { id: 'v5_27_p_01586_i_need_help_joining_circle_time', label: 'I need help joining circle time.', routeBucket: 'time_routine' }],
  ['v5_27_p_01578_i_need_help_with_homework', { id: 'v5_27_p_01578_i_need_help_starting_my_homework', label: 'I need help starting my homework.' }],
  ['v5_27_p_01588_i_need_help_with_lunch', { id: 'v5_27_p_01588_i_need_help_opening_my_lunch', label: 'I need help opening my lunch.' }],
  ['v5_27_p_01574_i_need_help_with_math', { id: 'v5_27_p_01574_i_need_help_solving_this_math_problem', label: 'I need help solving this math problem.' }],
  ['v5_27_p_01594_i_need_help_with_my_backpack', { id: 'v5_27_p_01594_i_need_help_organizing_my_backpack', label: 'I need help organizing my backpack.' }],
  ['v5_27_p_01592_i_need_help_with_my_schedule', { id: 'v5_27_p_01592_i_need_help_understanding_my_schedule', label: 'I need help understanding my schedule.' }],
  ['v5_27_p_01582_i_need_help_with_project', { id: 'v5_27_p_01582_i_need_help_planning_my_project', label: 'I need help planning my project.' }],
  ['v5_27_p_01581_i_need_help_with_quiz', { id: 'v5_27_p_01581_i_need_more_time_on_my_quiz', label: 'I need more time on my quiz.' }],
  ['v5_27_p_01575_i_need_help_with_reading', { id: 'v5_27_p_01575_i_need_help_understanding_what_i_read', label: 'I need help understanding what I read.' }],
  ['v5_27_p_01587_i_need_help_with_recess', { id: 'v5_27_p_01587_i_need_help_joining_a_game_at_recess', label: 'I need help joining a game at recess.' }],
  ['v5_27_p_01577_i_need_help_with_science', { id: 'v5_27_p_01577_i_need_help_with_the_science_experiment', label: 'I need help with the science experiment.' }],
  ['v5_27_p_01580_i_need_help_with_test', { id: 'v5_27_p_01580_i_need_more_time_on_my_test', label: 'I need more time on my test.' }],
  ['v5_27_p_01576_i_need_help_with_writing', { id: 'v5_27_p_01576_i_need_help_choosing_what_to_write', label: 'I need help choosing what to write.' }],
  ['v5_27_p_01832_i_want_to_play_basketball', { id: 'v5_27_p_01832_i_want_to_practice_basketball', label: 'I want to practice basketball.' }],
  ['v5_27_p_01840_i_want_to_play_outside', { id: 'v5_27_p_01840_i_want_to_go_outside_and_play', label: 'I want to go outside and play.' }],
  ['v5_27_p_01836_i_want_to_play_race', { id: 'v5_27_p_01836_i_want_to_start_a_race', label: 'I want to start a race.' }],
  ['v5_27_p_01833_i_want_to_play_soccer', { id: 'v5_27_p_01833_i_want_to_practice_soccer', label: 'I want to practice soccer.' }],
  ['v5_27_p_01834_i_want_to_play_tag', { id: 'v5_27_p_01834_i_want_to_play_a_game_of_tag', label: 'I want to play a game of tag.' }],
  ['v5_27_p_01839_i_want_to_play_trampoline', { id: 'v5_27_p_01839_i_want_to_jump_on_the_trampoline', label: 'I want to jump on the trampoline.', routeBucket: 'activity' }]
]);

const payload = JSON.parse(await readFile(catalogPath, 'utf8'));
const repairedIds = new Set([...replacements.values()].map(({ id }) => id));
let replaced = 0;
let alreadyRepaired = 0;

for (const words of Object.values(payload.buckets)) {
  for (const word of words) {
    const replacement = replacements.get(word.id);
    if (replacement) {
      Object.assign(word, replacement, { spoken: replacement.label });
      replaced += 1;
    } else if (repairedIds.has(word.id)) {
      alreadyRepaired += 1;
    }
  }
}

if (replaced + alreadyRepaired !== replacements.size) {
  throw new Error(`Expected ${replacements.size} duplicate records; found ${replaced + alreadyRepaired}.`);
}

if (replaced) await writeFile(catalogPath, `${JSON.stringify(payload)}\n`);

console.log(replaced
  ? `Replaced ${replaced} duplicate labels with unique approved phrases.`
  : 'Duplicate-label repair was already applied.');
