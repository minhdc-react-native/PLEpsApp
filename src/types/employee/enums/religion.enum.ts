// Tôn giáo
export const RELIGION_TYPES = {
  NONE: 'Không',
  BUDDHISM: 'Phật giáo',
  CHRISTIANITY: 'Thiên chúa giáo',
  ISLAM: 'Đạo Hồi',
  OTHER: 'Khác',
  CAO_DAI: 'Cao Đài',
  PROTESTANTISM: 'Tin Lành',
  CATHOLICISM: 'Công giáo',
} as const;

export type Religion = (typeof RELIGION_TYPES)[keyof typeof RELIGION_TYPES];
