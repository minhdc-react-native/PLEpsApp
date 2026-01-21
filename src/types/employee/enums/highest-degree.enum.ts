// Học vị (cao nhất)
export const HIGHEST_DEGREE_TYPES = {
  MASTER: 'Thạc sĩ',
  ENGINEER: 'Kỹ sư',
  BACHELOR: 'Cử nhân',
  INTERMEDIATE: 'Trung cấp',
  HIGH_SCHOOL: 'Tú tài',
  WORKER: 'Công nhân',
  OTHER: 'Khác',
  COLLEGE_BACHELOR: 'Cử nhân Cao đẳng',
  COLLEGE: 'Cao đẳng',
} as const;

export type HighestDegree =
  (typeof HIGHEST_DEGREE_TYPES)[keyof typeof HIGHEST_DEGREE_TYPES];
