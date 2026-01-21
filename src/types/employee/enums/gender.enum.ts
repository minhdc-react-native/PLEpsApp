export const GENDERS = {
  MALE: 1,
  FEMALE: 2,
} as const;

export type Gender = (typeof GENDERS)[keyof typeof GENDERS];

export const GENDER_LABELS: Record<Gender, string> = {
  [GENDERS.MALE]: "Nam",
  [GENDERS.FEMALE]: "Nữ",
};
