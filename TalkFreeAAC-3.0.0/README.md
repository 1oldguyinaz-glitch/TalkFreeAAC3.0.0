# TalkFreeAAC 3.0.0

TalkFreeAAC is a staged AAC communication platform organized around AXIS, a permanent six-column language path based on the modified Fitzgerald Key.

## Complete profile system

The board supports all 16 combinations of four age bands and four communication stages:

- Early Childhood (ages 2–5)
- School Age (ages 6–12)
- Teen (ages 13–17)
- Adult (ages 18+)

Every stage shows only its active column. Column positions and Fitzgerald colors remain stable while the path expands:

| Stage | Name | AXIS path |
| --- | --- | --- |
| 1 | Emerging Talker | Start → Act → Target |
| 2 | Expanding Talker | Start → Act → Describe → Target |
| 3 | Sentence Builder | Start → Act → Own → Describe → Target |
| 4 | Advanced Communicator | Start → Act → Modify → Own → Describe → Target |

Early Childhood, School Age, and Teen Stage 1 retain their approved dedicated catalogs. Adult Stage 1 and Stages 2–4 use the progressive compiled catalog. The compiled source contains 10,000 accounted records: 9,995 bucketed words and five always-available communication controls.

The interface also includes:

- responsive single-column bucket and word grids
- photographic tiles where approved assets are available
- Speak and optional Every Word speech controls
- permanent emergency and interrupt controls
- a School topics setting for reducing home-screen choices
- a safety gate for explicit private-parts vocabulary
- short extraction-safe asset paths under `web/public/p/`

## Repository structure

```text
TalkFreeAAC-3.0.0/
├── LICENSE
├── README.md
├── package.json
└── web/
    ├── public/
    ├── scripts/
    ├── src/
    ├── tests/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── vite.config.js
```

## Development

From the repository root:

```bash
npm run install:web
npm run dev
```

Validation:

```bash
npm test
npm run validate:catalog
```

Production build:

```bash
npm run build
```

## Deployment checklist

- `npm test` reports all tests passing.
- `npm run validate:catalog` reports exactly 10,000 records.
- `npm run build` completes without errors.
- All four age bands and four stages can be selected in Settings.
- Only the current AXIS column is visible at every stage.
- Selecting a Target returns the board to Start while preserving the sentence.
- Every Word speaks selected words, but remains silent for bucket navigation.
- School and private-parts settings hide and restore their gated content.
- Speak, Yes, No, Help, Stop, Clear, and Stage 1 quick phrases work as expected.
