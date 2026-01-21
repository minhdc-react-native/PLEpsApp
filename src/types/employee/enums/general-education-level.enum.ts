// Trình độ văn hóa
export const GENERAL_EDUCATION_LEVEL_TYPES = {
  UNIVERSITY: 'Đại học',
  '1_12': '1/12',
  '2_12': '2/12',
  '3_12': '3/12',
  '4_12': '4/12',
  '5_12': '5/12',
  '6_12': '6/12',
  '7_12': '7/12',
  '8_12': '8/12',
  '9_12': '9/12',
  '10_12': '10/12',
  '11_12': '11/12',
  '12_12': '12/12',
} as const;

export type GeneralEducationLevel =
  (typeof GENERAL_EDUCATION_LEVEL_TYPES)[keyof typeof GENERAL_EDUCATION_LEVEL_TYPES];
