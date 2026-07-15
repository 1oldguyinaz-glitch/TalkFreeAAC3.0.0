# TalkFreeAAC 3.0.0

TalkFreeAAC is a staged AAC communication platform organized around a modified Fitzgerald Key approach.

## Current release

Early Childhood Emerging Talker, ages 2–5:

- 131 vocabulary words
- 5 Start buckets
- 4 Action buckets
- 8 Target buckets
- Fitzgerald grammatical colors
- One active full-screen column at a time
- Responsive bucket and word grids
- Photographic word and bucket tiles
- `my` routes directly to the Target column
- `don't` keeps the current Action bucket open

The complete 10,000-entry language catalog remains available for later stages and age bands.

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
