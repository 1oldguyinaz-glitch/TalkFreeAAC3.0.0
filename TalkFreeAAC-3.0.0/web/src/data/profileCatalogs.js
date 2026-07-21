import { AGE_BANDS, STAGE_DEFINITIONS } from '../board/constants.js';
import { EARLY_CHILDHOOD_STAGE_1_CATALOG } from './earlyChildhoodStage1Catalog.js';
import { SCHOOL_AGE_STAGE_1_CATALOG } from './schoolAgeStage1Catalog.js';
import { TEEN_STAGE_1_CATALOG } from './teenStage1Catalog.js';

const DEDICATED_CATALOGS = Object.freeze({
  early_childhood: Object.freeze({ 1: EARLY_CHILDHOOD_STAGE_1_CATALOG }),
  school_age: Object.freeze({ 1: SCHOOL_AGE_STAGE_1_CATALOG }),
  teen: Object.freeze({ 1: TEEN_STAGE_1_CATALOG }),
  adult: Object.freeze({})
});

export const PROFILE_KEYS = Object.freeze(
  Object.keys(AGE_BANDS).flatMap((ageBand) =>
    Object.keys(STAGE_DEFINITIONS).map((stage) => `${ageBand}:${stage}`)
  )
);

export function getCatalogProfile(ageBand, stage) {
  const catalog = DEDICATED_CATALOGS[ageBand]?.[stage] ?? null;
  return Object.freeze({
    key: `${ageBand}:${stage}`,
    ageBand,
    stage,
    source: catalog ? 'dedicated' : 'compiled',
    catalog
  });
}
