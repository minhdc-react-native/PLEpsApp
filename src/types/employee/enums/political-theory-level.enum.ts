// Trình độ LLCT
export const POLITICAL_THEORY_LEVEL_TYPES = {
  INTERMEDIATE: 'Trung cấp LLCT',
  BASIC: 'Sơ cấp LLCT',
  ADVANCED: 'Cao cấp LLCT',
} as const;

export type PoliticalTheoryLevel =
  (typeof POLITICAL_THEORY_LEVEL_TYPES)[keyof typeof POLITICAL_THEORY_LEVEL_TYPES];
