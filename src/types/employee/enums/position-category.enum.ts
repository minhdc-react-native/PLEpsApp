// Phân loại chức danh
export const POSITION_CATEGORY_TYPES = {
  INDIRECT: 'Gián tiếp',
  DIRECT: 'Trực tiếp',
} as const;

export type PositionCategory =
  (typeof POSITION_CATEGORY_TYPES)[keyof typeof POSITION_CATEGORY_TYPES];
