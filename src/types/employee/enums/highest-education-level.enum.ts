// Trình độ (cao nhất)
export const HIGHEST_EDUCATION_LEVEL_TYPES = {
  SAU_DAI_HOC: 'Sau đại học',
  THAC_SI: 'Thạc sĩ',
  DAI_HOC: 'Đại học',
  CAP_3: 'Cấp 3',
  TRUNG_CAP: 'Trung cấp',
  CAO_DANG_NGHE: 'Cao đẳng nghề',
  CAO_DANG: 'Cao đẳng',
  TRUNG_CAP_NGHE: 'Trung cấp nghề',
  CONG_NHAN_KY_THUAT: 'Công nhân kỹ thuật',
  CONG_NHAN_NGHE: 'Công nhân nghề',
  SO_CAP: 'Sơ cấp',
  CAP_2: 'Cấp 2',
  KHAC: 'Khác',
} as const;

export type HighestEducationLevel =
  (typeof HIGHEST_EDUCATION_LEVEL_TYPES)[keyof typeof HIGHEST_EDUCATION_LEVEL_TYPES];
