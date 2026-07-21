# TalkFreeAAC final two-part upload

Both ZIP files are required. Together they contain the complete reviewed source, every updated photo, all four ages, and all four stages. Neither part is optional.

## Install with GitHub Desktop

1. Download and extract `TalkFreeAAC_FINAL_Part_1_Project_and_S1_Photos.zip` and `TalkFreeAAC_FINAL_Part_2_E1_Photos.zip` into the same temporary folder. Allow the folders to merge.
2. In GitHub Desktop, fetch `main` and create branch `release/axis-final`.
3. In the local repository, delete these misplaced duplicate folders if they exist:
   - `TalkFreeAAC-3.0.0/public/`
   - `TalkFreeAAC-3.0.0/src/`
   - `TalkFreeAAC-3.0.0/tests/`
4. Copy `.gitattributes`, `.gitignore`, `.github/`, and `TalkFreeAAC-3.0.0/` from the merged temporary folder into the repository root. Choose **Replace/Overwrite** when prompted.
5. Confirm GitHub Desktop shows additions, replacements, moves, and deletions. It must not show only the two ZIP files.
6. Commit as `release: complete and verify AXIS profiles`, publish the branch, and open a pull request into `main`.
7. In GitHub **Settings → Pages**, choose **GitHub Actions** as the publishing source.

## Required repository-relative paths

- `.github/workflows/deploy-pages.yml`
- `.gitattributes`
- `.gitignore`
- `TalkFreeAAC-3.0.0/package.json`
- `TalkFreeAAC-3.0.0/web/package.json`
- `TalkFreeAAC-3.0.0/web/package-lock.json`
- `TalkFreeAAC-3.0.0/web/vite.config.js`
- `TalkFreeAAC-3.0.0/web/src/board/`
- `TalkFreeAAC-3.0.0/web/src/data/`
- `TalkFreeAAC-3.0.0/web/public/catalog/`
- `TalkFreeAAC-3.0.0/web/public/p/e1/`
- `TalkFreeAAC-3.0.0/web/public/p/s1/`
- `TalkFreeAAC-3.0.0/web/scripts/`
- `TalkFreeAAC-3.0.0/web/tests/`

The canonical application exists only under `TalkFreeAAC-3.0.0/web/`.

## Verification before deployment

From `TalkFreeAAC-3.0.0/` run:

```bash
npm test
npm run validate:catalog
npm run build
```

Confirm:

- [ ] `142` tests pass and none fail.
- [ ] Catalog validation reports `478` buckets, `9,995` bucketed entries, `5` controls, and exactly `10,000` records.
- [ ] No normalized vocabulary duplicates are reported.
- [ ] Production build succeeds. The roughly 505 kB chunk warning is informational.
- [ ] All 16 age/stage combinations are available.
- [ ] Stages 1–4 display only the active AXIS column.
- [ ] Every Word speaks sentence selections, not bucket navigation.
- [ ] School and private-parts gates hide and restore content.
- [ ] Settings traps focus, supports Escape, and restores focus.
- [ ] GitHub Actions finishes green and the deployed site loads catalogs and photos.
