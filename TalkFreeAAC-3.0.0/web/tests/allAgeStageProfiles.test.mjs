import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AGE_BANDS,
  STAGE_DEFINITIONS
} from '../src/board/constants.js';
import {
  boardReducer,
  createInitialBoardState,
  isColumnInteractive
} from '../src/board/boardMachine.js';
import {
  getCatalogProfile,
  PROFILE_KEYS
} from '../src/data/profileCatalogs.js';
import { loadCompiledCatalog } from './helpers/loadCompiledCatalog.mjs';

const ages = Object.keys(AGE_BANDS);
const stages = Object.keys(STAGE_DEFINITIONS).map(Number);

function testWord(ageBand, stage, column) {
  return {
    id: `${ageBand}-${stage}-${column}`,
    label: `Column ${column}`,
    spoken: `column ${column}`,
    column,
    role: column === 6 ? 'noun' : 'test',
    slamShutTrigger: column === 6
  };
}

test('the product registry accounts for all 16 age and stage profiles', () => {
  assert.equal(PROFILE_KEYS.length, 16);
  assert.equal(new Set(PROFILE_KEYS).size, 16);

  for (const ageBand of ages) {
    for (const stage of stages) {
      const profile = getCatalogProfile(ageBand, stage);
      assert.equal(profile.key, `${ageBand}:${stage}`);
      assert.ok(['dedicated', 'compiled'].includes(profile.source));
    }
  }
});

test('approved Stage 1 catalogs are reused without duplicating later-stage data', () => {
  for (const ageBand of ['early_childhood', 'school_age', 'teen']) {
    assert.equal(getCatalogProfile(ageBand, 1).source, 'dedicated');
    assert.ok(getCatalogProfile(ageBand, 1).catalog);
  }

  assert.equal(getCatalogProfile('adult', 1).source, 'compiled');
  for (const ageBand of ages) {
    for (const stage of [2, 3, 4]) {
      assert.equal(getCatalogProfile(ageBand, stage).source, 'compiled');
      assert.equal(getCatalogProfile(ageBand, stage).catalog, null);
    }
  }
});

for (const ageBand of ages) {
  for (const stage of stages) {
    test(`${AGE_BANDS[ageBand].label} Stage ${stage} follows one active AXIS column`, () => {
      const path = STAGE_DEFINITIONS[stage].path;
      let state = createInitialBoardState(stage, ageBand);

      for (const column of path) {
        assert.equal(state.activeColumn, column);
        for (let candidate = 1; candidate <= 6; candidate += 1) {
          assert.equal(
            isColumnInteractive(state, candidate),
            candidate === column,
            `Column ${candidate}`
          );
        }

        state = boardReducer(state, {
          type: 'SELECT_WORD',
          column,
          word: testWord(ageBand, stage, column)
        });
      }

      assert.equal(state.activeColumn, 1);
      assert.equal(state.sentence.length, path.length);
      for (let column = 1; column <= 6; column += 1) {
        assert.equal(state.columnViews[column].mode, 'buckets');
      }
    });
  }
}

test('compiled policies keep exact progressive totals for every age and stage', async () => {
  const { manifest } = await loadCompiledCatalog();

  for (const ageBand of ages) {
    let previous = 0;
    for (const stage of stages) {
      const stageKey = String(stage);
      const bucketed = manifest.bucketedWordCountsByAgeStage[ageBand][stageKey];
      const displayed = manifest.displayWordCountsByAgeStage[ageBand][stageKey];
      const byColumn = manifest.wordCountsByAgeStageColumn[ageBand][stageKey];

      assert.equal(
        Object.values(byColumn).reduce((sum, count) => sum + count, 0),
        bucketed
      );
      assert.equal(displayed, bucketed + 5);
      assert.ok(bucketed >= previous);
      previous = bucketed;

      const path = new Set(STAGE_DEFINITIONS[stage].path);
      for (let column = 1; column <= 6; column += 1) {
        if (!path.has(column)) assert.equal(byColumn[String(column)], 0);
      }
    }
  }
});
