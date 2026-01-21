// Hình thức đào tạo (cao nhất)
export const TRAINING_MODE_TYPES = {
  OTHER: 'Khác',
  REGULAR: 'Chính quy',
  DIPLOMA_2: 'Văn bằng 2',
  IN_SERVICE: 'Tại chức',
  WORK_STUDY: 'Vừa học vừa làm',
  DISTANCE: 'Từ xa',
  CONTINUOUS: 'Liên thông',
  VOCATIONAL: 'Học nghề',
  NON_REGULAR: 'Không chính quy',
  INTENSIVE: 'Tập trung',
  SHORT_TERM: 'Ngắn hạn',
} as const;

export type TrainingMode =
  (typeof TRAINING_MODE_TYPES)[keyof typeof TRAINING_MODE_TYPES];
