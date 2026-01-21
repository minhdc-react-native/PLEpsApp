export const EXAM_STATUS = {
  DRAFT: 0,
  REGISTRATION: 1,
  REVIEW: 2,
  APPROVED: 3,
  TOPIC_REGISTRATION: 4,
  TOPIC_APPROVED: 5,
  EDUCATION_RESULT: 6,
  EXAM: 96,
  ENTER_RESULT: 97,
  ENTER_DECISION: 98,
  COMPLETED: 99,
} as const;

export type ExamStatus = (typeof EXAM_STATUS)[keyof typeof EXAM_STATUS];

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  [EXAM_STATUS.DRAFT]: "Nháp",
  [EXAM_STATUS.REGISTRATION]: "Đăng Ký Thi",
  [EXAM_STATUS.REVIEW]: "Rà Soát DS Thi",
  [EXAM_STATUS.APPROVED]: "Phê Duyệt DS Thi",
  [EXAM_STATUS.TOPIC_REGISTRATION]: "Đăng Ký Đề Tài",
  [EXAM_STATUS.TOPIC_APPROVED]: "Phê Duyệt DS Đề Tài",
  [EXAM_STATUS.EDUCATION_RESULT]: "Kết Quả Bồi Huấn",
  [EXAM_STATUS.EXAM]: "Thi",
  [EXAM_STATUS.ENTER_RESULT]: "Nhập Kết Quả",
  [EXAM_STATUS.ENTER_DECISION]: "Nhập Quyết Định",
  [EXAM_STATUS.COMPLETED]: "Kết Thúc",
};
