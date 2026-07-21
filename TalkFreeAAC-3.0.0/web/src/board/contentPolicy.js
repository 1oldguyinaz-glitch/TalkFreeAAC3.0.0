import { DEFAULT_CONTENT_SETTINGS } from './constants.js';

const PRIVATE_PARTS_TERMS = new Set([
  'private parts',
  'genitals',
  'breasts',
  'nipples',
  'penis',
  'testicles',
  'scrotum',
  'foreskin',
  'vulva',
  'vagina',
  'clitoris',
  'uterus',
  'buttocks',
  'anus',
  'groin',
  'pubic area'
]);

function normalizedLabel(item) {
  return String(item?.label ?? '')
    .toLowerCase()
    .replace(/[.!?]/g, '')
    .trim();
}

export function isSchoolContent(item) {
  if (item?.visibilityGroup === 'school') return true;
  if (item?.semanticCategory === 'school_work') return true;
  return /\b(school|classroom|homework|academic)\b/i.test(item?.label ?? '');
}

export function isPrivatePartsContent(item) {
  if (item?.safetyGate === 'private_parts') return true;
  const label = normalizedLabel(item);
  if (PRIVATE_PARTS_TERMS.has(label)) return true;
  return /\bprivate parts\b/i.test(label);
}

export function itemIsContentEnabled(
  item,
  contentSettings = DEFAULT_CONTENT_SETTINGS
) {
  if (!contentSettings.showSchool && isSchoolContent(item)) return false;
  if (!contentSettings.showPrivateParts && isPrivatePartsContent(item)) {
    return false;
  }
  return true;
}
