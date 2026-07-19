import { SCHOOL_AGE_STAGE_1_CATALOG } from './schoolAgeStage1Catalog.js';

const WORDS_PER_PAGE = 16;
const BUCKETS_PER_PAGE = 8;

const slug = (value) => value
  .normalize('NFKD')
  .replace(/[’‘]/g, "'")
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const keyFor = (value) => value
  .normalize('NFKD')
  .replace(/[’‘]/g, "'")
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

function pageSlot(index, capacity) {
  return {
    page: Math.floor(index / capacity) + 1,
    slot: (index % capacity) + 1
  };
}

function list(pipeSeparatedLabels) {
  return pipeSeparatedLabels
    .split('|')
    .map((label) => label.trim())
    .filter(Boolean);
}

function item(label, options = {}) {
  return { label, ...options };
}

function leaf(code, label, labels, options = {}) {
  return { code, label, words: labels, ...options };
}

function branch(code, label, children, options = {}) {
  return { code, label, children, ...options };
}

function schoolWordAssets() {
  const assets = new Map();

  for (const columnData of Object.values(SCHOOL_AGE_STAGE_1_CATALOG)) {
    for (const bucket of columnData.buckets || []) {
      for (const word of bucket.words || []) {
        if (word.targetBucketId || !word.label || !word.sourceId) continue;
        const key = keyFor(word.label);
        const candidate = {
          sourceId: word.sourceId,
          imageSrc: word.imageSrc,
          imageIncludesLabel: word.imageIncludesLabel,
          plannedImageSrc: word.plannedImageSrc
        };
        const current = assets.get(key);
        const candidateIsCanonical =
          candidate.imageSrc && candidate.imageSrc === candidate.plannedImageSrc;
        const currentIsCanonical =
          current?.imageSrc && current.imageSrc === current.plannedImageSrc;

        if (!current || (candidateIsCanonical && !currentIsCanonical)) {
          assets.set(key, candidate);
        }
      }
    }
  }

  return assets;
}

function schoolBucketAssets() {
  const exactPaths = new Map();
  const byLabel = new Map();

  for (const [columnKey, columnData] of Object.entries(SCHOOL_AGE_STAGE_1_CATALOG)) {
    const byId = new Map(columnData.buckets.map((bucket) => [bucket.id, bucket]));
    const paths = new Map();

    function pathFor(bucket) {
      if (paths.has(bucket.id)) return paths.get(bucket.id);
      const parent = bucket.parentBucketId && byId.get(bucket.parentBucketId);
      const path = parent
        ? pathFor(parent).concat(bucket.label)
        : [bucket.label];
      paths.set(bucket.id, path);
      return path;
    }

    for (const bucket of columnData.buckets) {
      const asset = {
        imageSrc: bucket.imageSrc,
        imageIncludesLabel: bucket.imageIncludesLabel,
        plannedImageSrc: bucket.plannedImageSrc
      };
      const path = pathFor(bucket).map(keyFor).join(' / ');
      exactPaths.set(columnKey + ':' + path, asset);
      const labelKey = keyFor(bucket.label);
      if (!byLabel.has(labelKey)) byLabel.set(labelKey, []);
      byLabel.get(labelKey).push(asset);
    }
  }

  return { exactPaths, byLabel };
}

const SCHOOL_WORD_ASSETS = schoolWordAssets();
const SCHOOL_BUCKET_ASSETS = schoolBucketAssets();

function wordAsset(label, sense) {
  if (!sense) {
    const existing = SCHOOL_WORD_ASSETS.get(keyFor(label));
    if (existing) return existing;
  }

  const fileStem = [slug(label), sense ? slug(sense) : null]
    .filter(Boolean)
    .join('-');

  return {
    sourceId: 't1-word-' + fileStem,
    plannedImageSrc: '/p/t1/w/' + fileStem + '.jpg'
  };
}

function bucketAsset(column, path, code, label) {
  const pathKey = String(column) + ':' + path.map(keyFor).join(' / ');
  const exact = SCHOOL_BUCKET_ASSETS.exactPaths.get(pathKey);
  if (exact) return exact;

  const sameLabel = SCHOOL_BUCKET_ASSETS.byLabel.get(keyFor(label)) || [];
  if (sameLabel.length === 1) return sameLabel[0];

  return {
    plannedImageSrc: '/p/t1/b/' + code + '.jpg'
  };
}

const SPOKEN_OVERRIDES = new Map([
  ["Women's Needs\u0000pad", 'need a pad'],
  ["Women's Needs\u0000tampon", 'need a tampon']
]);

function directWord(spec, bucket, index) {
  const definition = typeof spec === 'string' ? { label: spec } : spec;
  const position = pageSlot(index, WORDS_PER_PAGE);
  const asset = wordAsset(definition.label, definition.sense);
  const spoken =
    definition.spoken ??
    SPOKEN_OVERRIDES.get(bucket.label + '\u0000' + definition.label) ??
    definition.label;
  const word = {
    id:
      bucket.id +
      '-w-' +
      String(position.page) +
      '-' +
      String(position.slot),
    ...asset,
    label: definition.label,
    spoken,
    column: bucket.column,
    role: definition.role ?? bucket.role,
    colorRole: definition.colorRole ?? bucket.colorRole,
    slot: position.slot,
    page: position.page
  };

  if (bucket.column === 1) {
    word.nextColumnOverride = bucket.role === 'possessive' ? 6 : 2;
    if (
      bucket.role === 'person' ||
      ['he', 'she', 'it', 'someone'].includes(keyFor(definition.label))
    ) {
      word.subjectAgreement = 'third_person';
    }
  } else if (bucket.column === 2) {
    word.nextColumnOverride = 6;
  } else if (bucket.column === 6) {
    word.slamShutTrigger = true;
  }

  return word;
}

function navigationWord(child, parent, index) {
  const position = pageSlot(index, WORDS_PER_PAGE);
  return {
    id: parent.id + '-nav-' + child.id.replace(/^t1-c[126]-/, ''),
    label: child.label,
    spoken: child.label.toLowerCase(),
    column: parent.column,
    role: child.role,
    colorRole: child.colorRole,
    slot: position.slot,
    page: position.page,
    targetBucketId: child.id,
    ...(child.imageSrc ? { imageSrc: child.imageSrc } : {}),
    ...(child.imageIncludesLabel !== undefined
      ? { imageIncludesLabel: child.imageIncludesLabel }
      : {}),
    plannedImageSrc: child.plannedImageSrc
  };
}

function buildColumn(column, rootSpecs) {
  const buckets = [];

  function build(spec, parent, path, position, inherited = {}) {
    const role = spec.role ?? inherited.role ?? (column === 2 ? 'verb' : 'target');
    const colorRole = spec.colorRole ?? inherited.colorRole ?? role;
    const visibilityGroup = spec.visibilityGroup ?? inherited.visibilityGroup;
    const nextPath = path.concat(spec.label);
    const asset = bucketAsset(column, nextPath, spec.code, spec.label);
    const bucket = {
      id: 't1-' + spec.code,
      label: spec.label,
      column,
      slot: position.slot,
      page: position.page,
      role,
      colorRole,
      ...(asset.imageSrc ? { imageSrc: asset.imageSrc } : {}),
      ...(asset.imageIncludesLabel !== undefined
        ? { imageIncludesLabel: asset.imageIncludesLabel }
        : {}),
      plannedImageSrc: asset.plannedImageSrc,
      words: []
    };

    if (parent) bucket.parentBucketId = parent.id;
    if (spec.parentBucketId) bucket.parentBucketId = spec.parentBucketId;
    if (visibilityGroup) bucket.visibilityGroup = visibilityGroup;
    if (spec.safetyGate) bucket.safetyGate = spec.safetyGate;

    buckets.push(bucket);

    if (spec.children) {
      const builtChildren = spec.children.map((childSpec, index) =>
        build(
          childSpec,
          bucket,
          nextPath,
          pageSlot(index, WORDS_PER_PAGE),
          {
            role,
            colorRole,
            visibilityGroup: spec.visibilityGroup
          }
        )
      );
      bucket.words = builtChildren
        .filter((child, index) => !spec.children[index].hiddenFromParent)
        .map((child, index) => navigationWord(child, bucket, index));
    } else {
      bucket.words = (spec.words || []).map((word, index) =>
        directWord(word, bucket, index)
      );
    }

    return bucket;
  }

  rootSpecs.forEach((spec, index) => {
    const position = spec.hiddenRoot
      ? { page: 1, slot: 1 }
      : pageSlot(
          rootSpecs
            .slice(0, index)
            .filter((candidate) => !candidate.hiddenRoot)
            .length,
          BUCKETS_PER_PAGE
        );
    build(spec, null, [], position);
  });

  return { column, buckets };
}

const COLUMN_1 = [
  leaf('c1-who', 'Who', list('I|you|we|he|she|they|it|someone'), {
    role: 'pronoun',
    colorRole: 'pronoun'
  }),
  leaf('c1-own', 'Belongs To', list('my|your|our|his|her|their'), {
    role: 'possessive',
    colorRole: 'possessive'
  }),
  branch('c1-ppl', 'People', [
    leaf(
      'c1-ppl-fam',
      'Family',
      list('mom|dad|parent|brother|sister|sibling|grandma|grandpa|aunt|uncle|cousin|baby|family|guardian|stepmom|stepdad')
    ),
    leaf(
      'c1-ppl-fri',
      'Friends',
      list('friend|best friend|classmate|teammate|neighbor|group|team|everyone')
    ),
    leaf(
      'c1-ppl-sch',
      'School',
      list('teacher|principal|counselor|coach|school nurse|aide|bus driver|substitute')
    ),
    leaf(
      'c1-ppl-help',
      'Helpers',
      list('caregiver|therapist|helper|assistant|doctor|dentist|police officer|firefighter')
    ),
    leaf(
      'c1-ppl-work',
      'Workers',
      list('cashier|librarian|server|cook|driver|mechanic|barber|stylist')
    ),
    leaf(
      'c1-ppl-rel',
      'Relationships',
      list('boyfriend|girlfriend|partner|crush')
    ),
    leaf(
      'c1-ppl-sup',
      'Support Team',
      list('case manager|social worker|speech therapist|occupational therapist|behavior therapist|paraeducator|advocate|interpreter')
    )
  ], {
    role: 'person',
    colorRole: 'person'
  }),
  leaf(
    'c1-phr',
    'Phrases',
    list("Hi|See you later|Thank you|Sorry|Excuse me|I don't know|Say that again|That's cool|I need a break|Give me a minute|I don't understand|Leave me alone|I'm okay|Not right now|Please stop|Can you help me"),
    { role: 'social', colorRole: 'social' }
  ),
  leaf(
    'c1-q',
    'Questions',
    list('Who|What|When|Where|Why|How|Can|Will|Do|Did'),
    { role: 'question', colorRole: 'question' }
  )
];

const COLUMN_2 = [
  leaf('c2-feel', 'Feelings', list('feel|like|love|hate|miss|care about|worry about|trust|prefer|enjoy')),
  leaf('c2-move', 'Moving', list('go|come|walk|run|jump|climb|ride|play|move|sit|stand|leave|stay|drive|dance|swim')),
  leaf('c2-act', 'Actions', list('want|need|have|get|give|gave|use|find|found|choose|hurt|hit|push|pushed|take|took|see|saw')),
  leaf('c2-talk', 'Talking', list('ask|answer|say|tell|told|show|showed|look at|listen to|call|called|text|talk to|message|email|share')),
  leaf('c2-learn', 'Learning', list('read|write|learn|practice|know|understand|remember|forget|finish|count|spell|study|research|search|solve|submit')),
  leaf('c2-do', 'Doing', list('make|build|put|open|close|turn on|turn off|charge|start|pause|continue|try|fix|hold|carry|change')),
  branch('c2-need', 'Needs', [
    leaf('c2-need-hung', 'Hunger Needs', list('eat|drink')),
    leaf('c2-need-pers', 'Personal Needs', list('wash|brush|dress|wear|sleep|wake|shower|use the bathroom|take medicine|exercise|stretch|shave|floss|use deodorant')),
    leaf('c2-need-women', "Women's Needs", list('pad|tampon'))
  ]),
  leaf('c2-sup', 'Support', list('help|helped|breathe|rest|wait|slow down|calm down|take a break|relax|focus')),
  leaf('c2-tech', 'Technology', list('log in|log out|save|delete|upload|download|send|post|type|tap|swipe|scroll|connect|disconnect|plug in|unplug')),
  leaf('c2-ind', 'Independence', [
    item('cook', { sense: 'action' }),
    ...list('clean|shop|buy|pay|order'),
    item('work', { sense: 'action' }),
    ...list('volunteer|plan|schedule|pack|unpack|budget|apply|sign'),
    item('check', { sense: 'verify' })
  ])
];

const FOOD_AND_DRINK = branch('c6-fd', 'Food and Drink', [
  branch('c6-fd-food', 'Food', [
    leaf('c6-fd-brk', 'Breakfast', list('breakfast|cereal|oatmeal|eggs|toast|pancakes|waffles|bacon|yogurt|bagel|muffin|breakfast sandwich|breakfast burrito|sausage|hash browns|fruit cup')),
    leaf('c6-fd-lun', 'Lunch', list('lunch|sandwich|soup|salad|pizza|chicken nuggets|hamburger|hot dog|wrap|sub sandwich|grilled cheese|quesadilla|burrito|ramen|leftovers|school lunch')),
    leaf('c6-fd-din', 'Dinner', list('dinner|chicken|fish|meat|rice|pasta|potatoes|tacos|steak|pork|turkey|beans|noodles|mac and cheese|stir-fry|curry')),
    leaf('c6-fd-fru', 'Fruit', list('fruit|apple|banana|orange|grapes|strawberry|watermelon|peach|pineapple|pear|mango|blueberries|raspberries|cherries|kiwi|cantaloupe')),
    leaf('c6-fd-veg', 'Vegetables', list('vegetables|carrots|broccoli|corn|peas|green beans|lettuce|tomato|cucumber|spinach|bell pepper|onion|mushrooms|zucchini|cauliflower|celery')),
    branch('c6-fd-snack', 'Snacks', [
      leaf('c6-fd-sn-h', 'Healthy Snacks', list('yogurt|cheese|crackers|granola bar|nuts|raisins|fruit|vegetables|pretzels|trail mix|protein bar|applesauce|hummus|rice cakes|beef jerky|sunflower seeds')),
      leaf('c6-fd-sn-t', 'Treats', list('chips|cookies|candy|chocolate|cake|ice cream|doughnut|popcorn|brownie|cupcake|pie|pudding|gummies|lollipop|milkshake|frozen yogurt'))
    ]),
    branch('c6-fd-out', 'Eating Out', [
      leaf('c6-fd-fast', 'Fast Food', list('hamburger|cheeseburger|fries|chicken nuggets|hot dog|pizza|tacos|fried chicken|chicken sandwich|combo meal')),
      leaf('c6-fd-rest', 'Restaurant', list('burrito|quesadilla|onion rings|mozzarella sticks|chicken wings|steak|grilled chicken|seafood|pasta|salad'))
    ])
  ]),
  branch('c6-fd-drink', 'Drinks', [
    leaf('c6-fd-water', 'Water', list('water|cold water|warm water|ice water|bottled water|sparkling water|flavored water|filtered water')),
    leaf('c6-fd-juice', 'Juice', list('apple juice|orange juice|grape juice|fruit punch|lemonade|cranberry juice|pineapple juice|mango juice|peach juice|mixed berry juice')),
    leaf('c6-fd-milk', 'Milk', list('milk|chocolate milk|strawberry milk|dairy-free milk|whole milk|2% milk|skim milk|lactose-free milk|almond milk|oat milk|soy milk|coconut milk')),
    leaf('c6-fd-soft', 'Soft Drinks', list('soda|cola|root beer|lemon-lime soda|orange soda|grape soda|cream soda|ginger ale|diet soda|zero-sugar soda|Coke|Pepsi|Dr Pepper|Mountain Dew|Sprite')),
    leaf('c6-fd-other', 'Other Drinks', list('smoothie|sports drink|hot chocolate|tea|coffee|iced coffee|boba tea|iced tea|energy drink|protein shake|coconut water|slushie'))
  ]),
  leaf('c6-fd-utens', 'Utensils', list('plate|bowl|cup|bottle|fork|spoon|knife|straw|napkin|lunchbox|tray|mug|glass|chopsticks|food container|thermos')),
  leaf('c6-fd-diet', 'Dietary Needs', list('food allergy|peanut allergy|tree nut allergy|dairy allergy|egg allergy|shellfish allergy|gluten-free|dairy-free|lactose-free|vegetarian|vegan|halal|kosher|low sugar|no spicy food|safe food')),
  leaf('c6-fd-order', 'Ordering', [
    ...list('menu|order|table|booth|reservation|server'),
    item('check', { sense: 'restaurant bill' }),
    ...list('receipt|tip|refill|takeout|delivery|pickup|drive-thru|dine in|to go')
  ]),
  branch('c6-fd-cg', 'Cooking and Groceries', [
    leaf('c6-fd-cook', 'Cooking', list('recipe|ingredients|stove|oven|microwave|refrigerator|freezer|air fryer|toaster|pot|pan|baking sheet|cutting board|spatula|measuring cup|can opener')),
    leaf('c6-fd-groc', 'Groceries', list('grocery store|grocery list|shopping cart|basket|aisle|produce|dairy|meat|bakery|frozen food|canned food|household supplies|coupon|price|checkout|grocery bag'))
  ])
]);

const PEOPLE = branch('c6-ppl', 'People', [
  leaf('c6-ppl-fam', 'Family', list('mom|dad|parent|brother|sister|sibling|grandma|grandpa|aunt|uncle|cousin|baby|family|guardian|stepmom|stepdad')),
  leaf('c6-ppl-fri', 'Friends', list('friend|best friend|classmate|teammate|neighbor|group|team|everyone')),
  leaf('c6-ppl-sch', 'School', list('teacher|principal|counselor|coach|school nurse|aide|bus driver|substitute')),
  leaf('c6-ppl-help', 'Helpers', list('caregiver|therapist|helper|assistant|doctor|dentist|police officer|firefighter')),
  leaf('c6-ppl-work', 'Workers', list('cashier|librarian|server|cook|driver|mechanic|barber|stylist')),
  leaf('c6-ppl-rel', 'Relationships', list('boyfriend|girlfriend|partner|crush')),
  leaf('c6-ppl-sup', 'Support Team', list('case manager|social worker|speech therapist|occupational therapist|behavior therapist|paraeducator|advocate|interpreter')),
  leaf('c6-ppl-pro', 'Pronouns', list('me|you|him|her|us|them|someone|nobody'))
], {
  role: 'person',
  colorRole: 'person'
});

const FEELINGS = branch('c6-feel', 'Feelings', [
  leaf('c6-feel-good', 'Good', list('happy|excited|proud|calm|okay|silly')),
  leaf('c6-feel-hard', 'Hard', list('sad|mad|scared|worried|nervous|bored|lonely|frustrated')),
  leaf('c6-feel-body', 'Body', list('tired|sick|hurt|hungry|thirsty|hot|cold|dizzy'))
], {
  role: 'descriptor',
  colorRole: 'descriptor'
});

const PLAY = branch('c6-play', 'Play', [
  leaf('c6-play-toy', 'Toys', list('ball|blocks|doll|toy cars|puzzle|cards|stuffed animal|fidget toy|action figure|building set|model kit|remote-control car|trading cards|collectible|slime|sensory toy')),
  leaf('c6-play-game', 'Games', list('game|board game|card game|video game|tag|hide-and-seek|mobile game|computer game|console game|online game|role-playing game|strategy game|trivia game|chess|checkers|arcade game')),
  leaf('c6-play-out', 'Outside', list('playground|swing|slide|bicycle|scooter|jump rope|park|hiking|camping|fishing|skateboard|roller skates|skate park|beach|picnic|swimming pool')),
  leaf('c6-play-sport', 'Sports', list('soccer|basketball|baseball|football|swimming|gymnastics|volleyball|tennis|track|wrestling|cheerleading|hockey|golf|martial arts|weightlifting|bowling')),
  leaf('c6-play-hobby', 'Hobbies', list('drawing|painting|music|singing|dancing|photography|reading|writing|cooking|baking|crafts|gardening|collecting|coding|sewing|making videos')),
  leaf('c6-play-ent', 'Entertainment', list('movie|TV show|music|concert|podcast|audiobook|YouTube|TikTok|streaming service|livestream|comic book|manga|anime|theater|arcade|social media')),
  leaf('c6-play-social', 'Social Activities', list('hangout|party|sleepover|date|school dance|prom|club|youth group|study group|team practice|birthday party|family gathering|community event|school event|field trip|volunteering'))
]);

const PLACES = branch('c6-place', 'Places', [
  leaf('c6-place-home', 'Home', list("home|bedroom|bathroom|kitchen|living room|yard|garage|friend's house|relative's house|apartment|dining room|laundry room|basement|porch|driveway|closet")),
  leaf('c6-place-sch', 'School', list("school|classroom|hallway|cafeteria|gym|library|office|playground|bus|computer lab|science lab|art room|music room|locker room|counselor's office|nurse's office")),
  leaf('c6-place-com', 'Community', list("park|store|restaurant|doctor's office|dentist's office|hospital|library|pool|mall|grocery store|pharmacy|bank|post office|police station|fire station|community center|clothing store")),
  leaf('c6-place-travel', 'Travel', [
    ...list('car|bus|train|airport|hotel|inside|outside|airplane|taxi|rideshare|ferry'),
    item('subway', { sense: 'transit' }),
    ...list('bus stop|train station|parking lot|gas station')
  ]),
  branch('c6-place-eat', 'Eating Places', [
    leaf('c6-place-fast', 'Fast Food Places', [
      ...list("McDonald's|Burger King|Wendy's|Taco Bell|KFC"),
      item('Subway', { sense: 'restaurant brand' }),
      ...list("Chick-fil-A|Domino's|Panda Express|Starbucks")
    ]),
    leaf('c6-place-rest', 'Restaurants', list("Applebee's|Chili's|Olive Garden|IHOP|Denny's|Red Robin|Buffalo Wild Wings|Outback Steakhouse|Red Lobster|local restaurant"))
  ]),
  branch('c6-place-work', 'Work and Volunteering', [
    leaf('c6-place-job', 'Workplaces', [
      item('work', { sense: 'place' }),
      ...list('office|warehouse|retail store|restaurant|hospital|school|job site|break room|training center')
    ]),
    leaf('c6-place-vol', 'Volunteer Places', list('food bank|animal shelter|community center|community garden|library|hospital|school|senior center|park cleanup|soup kitchen'))
  ])
], {
  role: 'place',
  colorRole: 'place'
});

const CARE = branch('c6-care', 'Care', [
  leaf('c6-care-bath', 'Bathroom', list('toilet|sink|toilet paper|soap|towel|shower|bathtub|bathroom stall|urinal|wipes|hand dryer|trash can|mirror|faucet|bathroom door|grab bar')),
  leaf('c6-care-hyg', 'Hygiene', list('toothbrush|toothpaste|shampoo|conditioner|comb|brush|deodorant|tissue|body wash|face wash|lotion|mouthwash|floss|razor|shaving cream|hair dryer')),
  leaf('c6-care-health', 'Health', list('medicine|bandage|thermometer|inhaler|glasses|hearing aid|prescription|pill|liquid medicine|pain medicine|allergy medicine|EpiPen|first-aid kit|crutches|face mask|blood sugar meter')),
  leaf('c6-care-comf', 'Comfort', list('pillow|blanket|ice pack|heating pad|stuffed animal|cushion|neck pillow|eye mask|slippers|robe|fan|humidifier|warm socks|comfort item|soft clothing|hot water bottle')),
  leaf('c6-care-equip', 'Equipment', list('wheelchair|walker|braces|communication device|cane|gait trainer|standing frame|prosthetic|orthotic|transfer board|shower chair|adaptive utensils|switch|eye-gaze device|tablet mount|wheelchair ramp')),
  leaf('c6-care-women', "Women's Care", list('pad|tampon|pantyliner|period underwear|menstrual cup|menstrual disc|period kit|disposal bag|sanitary wipes|spare underwear')),
  leaf('c6-care-sens', 'Sensory Supports', list('noise-canceling headphones|earplugs|sunglasses|fidget toy|weighted blanket|compression vest|chew necklace|sensory brush|weighted lap pad|body sock|rocking chair|sensory swing|visual timer|calm-down card|sensory kit|quiet space'))
]);

const BODY_PARTS = branch('c6-body', 'Body Parts', [
  leaf('c6-body-head', 'Head', list('head|face|hair|eye|ear|nose|mouth|teeth|tongue|throat|eyelid|cheek|lips|gums|chin|jaw')),
  leaf('c6-body-upper', 'Upper Body', list('neck|shoulder|chest|back|arm|elbow|hand|finger|wrist|palm|thumb|ribs|waist|armpit|upper back|lower back')),
  leaf('c6-body-lower', 'Lower Body', list('stomach|hip|leg|knee|ankle|foot|toe|thigh|shin|calf|kneecap|heel|sole|arch|pelvis|lower abdomen')),
  leaf('c6-body-in', 'Inside Body', list('brain|heart|lungs|stomach|liver|kidneys|bladder|bowel|bones|muscles|joints|blood|nerves|spine|skin|whole body')),
  leaf('c6-body-private', 'Private Parts', list('private parts|genitals|breasts|nipples|penis|testicles|scrotum|foreskin|vulva|vagina|clitoris|uterus|buttocks|anus|groin|pubic area'), {
    hiddenFromParent: true,
    safetyGate: 'private_parts'
  })
]);

const THINGS = branch('c6-thing', 'Things', [
  leaf('c6-thing-school', 'School Things', list('pencil|pen|paper|notebook|book|folder|binder|backpack|lunchbox|ruler|scissors|glue|crayons|markers|calculator|student ID')),
  leaf('c6-thing-home', 'Home Things', list('chair|table|bed|couch|lamp|door|key|clock|remote|television|fan|trash can|blanket|pillow|dresser|washer and dryer')),
  leaf('c6-thing-pers', 'Personal Things', list("wallet|purse|bag|keys|ID card|driver's permit|bus pass|watch|jewelry|water bottle|umbrella|sunglasses|headphones|charger|medication|communication card")),
  leaf('c6-thing-money', 'Money and Documents', list('money|cash|coins|debit card|credit card|gift card|paycheck|receipt|bill|coupon|insurance card|Social Security card|birth certificate|form|application|ticket')),
  leaf('c6-thing-work', 'Work Things', list('name badge|uniform|work shirt|safety vest|hard hat|work gloves|tools|time card|work schedule|clipboard|computer|headset|scanner|box|cart|locker'))
]);

const SCHOOL = branch('c6-school', 'School', [
  leaf('c6-school-class', 'Classroom', list('class|lesson|student|assignment|worksheet|homework|test|project|schedule|class period|bell schedule|due date|grade|quiz|group work|presentation')),
  leaf('c6-school-art', 'Art', list('art|drawing|painting|coloring|picture|craft|clay|paintbrush|sketchbook|canvas|sculpture|photography|digital art|graphic design|pottery|colored pencils')),
  leaf('c6-school-music', 'Music', [
    ...list('music|song|singing|instrument|piano|guitar|drums|concert|band|choir|orchestra|microphone'),
    item('keyboard', { sense: 'musical instrument' }),
    ...list('violin|flute|trumpet')
  ]),
  leaf('c6-school-dance', 'Dance', list('dance|dancing|practice|routine|performance|stage|costume|recital|ballet|hip-hop|jazz dance|tap dance|contemporary dance|choreography|dance team|dance partner')),
  leaf('c6-school-sport', 'Sports', list('sports|team|game|practice|coach|gym|soccer|basketball|volleyball|baseball|football|track|tennis|wrestling|cheerleading|swimming')),
  leaf('c6-school-math', 'Math', list('math|number|counting|addition|subtraction|problem|answer|calculator|multiplication|division|fraction|decimal|algebra|geometry|graph|equation')),
  leaf('c6-school-sci', 'Science', list('science|experiment|animal|plant|space|weather|body|lab|biology|chemistry|physics|earth science|microscope|cell|molecule|ecosystem')),
  leaf('c6-school-eng', 'English', list('English|reading|writing|book|story|poem|essay|paragraph|sentence|word|spelling|grammar|vocabulary|character|chapter|author')),
  leaf('c6-school-hist', 'History and Social Studies', list('history|social studies|government|civics|geography|map|country|state|city|president|election|law|economics|culture|timeline|historical event')),
  leaf('c6-school-tech', 'Technology and Coding', [
    ...list('technology|computer|keyboard|mouse|internet|website|app|coding|code|program|robot|file'),
    item('folder', { sense: 'digital' }),
    ...list('login|password|digital project')
  ]),
  leaf('c6-school-lang', 'World Languages', list('language|Spanish|French|German|Mandarin|Japanese|Korean|Arabic|American Sign Language|interpreter|translation|speaking|listening|reading|writing|vocabulary')),
  leaf('c6-school-health', 'Health', list('health|health class|nutrition|exercise|hygiene|sleep|stress|safety|first aid|body|puberty|relationships|consent|mental health|medicine|wellness')),
  leaf('c6-school-life', 'Life Skills and Career', [
    ...list('life skills|career|job'),
    item('work', { sense: 'action' }),
    ...list('resume|application|interview|training|internship|volunteer work|money|budget|cooking|cleaning|transportation|schedule')
  ])
], {
  visibilityGroup: 'school'
});

const CLOTHES = branch('c6-cloth', 'Clothes', [
  leaf('c6-cloth-top', 'Tops', list('shirt|T-shirt|sweatshirt|sweater|jacket|coat|hoodie|tank top|long-sleeve shirt|button-up shirt|polo shirt|blouse|jersey|vest|blazer|uniform shirt')),
  leaf('c6-cloth-bot', 'Bottoms', list('pants|shorts|skirt|dress|jeans|leggings|sweatpants|joggers|cargo pants|dress pants|uniform pants|athletic shorts|jean shorts|overalls|tights|capri pants')),
  leaf('c6-cloth-feet', 'Feet', list('socks|shoes|boots|sandals|sneakers|athletic shoes|dress shoes|slippers|flip-flops|rain boots|snow boots|work boots|cleats|high heels|ankle socks|shoe inserts')),
  leaf('c6-cloth-other', 'Other', list('underwear|pajamas|swimsuit|uniform|hat|gloves|belt|change of clothes|bra|sports bra|boxers|briefs|undershirt|robe|scarf|tie'))
]);

const TECHNOLOGY = branch('c6-tech', 'Technology', [
  leaf('c6-tech-device', 'Devices', list('phone|tablet|laptop|computer|television|game console|camera|smartwatch|printer|scanner|smart speaker|VR headset|e-reader|projector|webcam|gaming computer')),
  leaf('c6-tech-part', 'Parts', list('screen|keyboard|mouse|headphones|charger|remote|controller|monitor|cable|plug|battery|power button|microphone|speaker|touch screen|USB drive')),
  leaf('c6-tech-media', 'Media', list('app|game|photo|video|message|music|internet|podcast|audiobook|livestream|social media|website|email|streaming service|online class|news')),
  leaf('c6-tech-app', 'Apps and Platforms', list('YouTube|TikTok|Instagram|Snapchat|ChatGPT|Discord|Spotify|Netflix|Twitch|Roblox|Disney+|Hulu|Google Classroom|Zoom|Gmail|school portal')),
  leaf('c6-tech-file', 'Files and Accounts', [
    ...list('file'),
    item('folder', { sense: 'digital' }),
    ...list('document|account|username|password|email address|profile|login|cloud storage|backup|link|attachment|notification|settings|QR code')
  ]),
  leaf('c6-tech-access', 'Accessibility Technology', list('AAC app|communication device|speech-generating device|eye-gaze device|switch|switch interface|adaptive keyboard|adaptive mouse|screen reader|text-to-speech|speech-to-text|captions|magnifier|assistive listening device|tablet mount|stylus'))
]);

const CONTROL = branch('c6-control', 'Control', [
  leaf('c6-control-time', 'Timing', list('start|stop|wait|next|again|finished|now|later|soon|first|last|pause|continue|before|after|not yet')),
  leaf('c6-control-amt', 'Amount', list('more|less|enough|all|none|some|another|a little|a lot|full|empty|half|one|two|too much|too little')),
  leaf('c6-control-speed', 'Speed', list('fast|slow|faster|slower|too fast|too slow|normal speed|same speed|speed up|slow down')),
  leaf('c6-control-sound', 'Sound', list('loud|quiet|louder|quieter|too loud|too quiet|volume up|volume down|mute|unmute|sound on|sound off'))
], {
  role: 'descriptor',
  colorRole: 'descriptor'
});

const QUICK_ACCESS_SAFETY = leaf(
  'c6-safety',
  'Quick Access Safety',
  list('safe|danger|emergency|lost|fire|smoke|allergy|choking|bleeding|breathing trouble|911|safe adult|unsafe|bullying|someone hurt me|someone touched me'),
  {
    hiddenRoot: true,
    parentBucketId: '__quick_access__'
  }
);

const COLUMN_6 = [
  FOOD_AND_DRINK,
  PEOPLE,
  FEELINGS,
  PLAY,
  PLACES,
  CARE,
  BODY_PARTS,
  THINGS,
  SCHOOL,
  CLOTHES,
  TECHNOLOGY,
  CONTROL,
  QUICK_ACCESS_SAFETY
];

export const TEEN_STAGE_1_CATALOG = Object.freeze({
  1: buildColumn(1, COLUMN_1),
  2: buildColumn(2, COLUMN_2),
  3: { column: 3, buckets: [] },
  4: { column: 4, buckets: [] },
  5: { column: 5, buckets: [] },
  6: buildColumn(6, COLUMN_6)
});
