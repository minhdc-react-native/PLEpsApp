export const EXAMINEE_TAKEN_EXAM_STATUS = {
  NOT_TAKEN_YET: 0,
  HAS_TAKEN: 1,
  CANCELLED: 2,
} as const;

export type ExamineeTakenExamStatus =
  (typeof EXAMINEE_TAKEN_EXAM_STATUS)[keyof typeof EXAMINEE_TAKEN_EXAM_STATUS];

export const EXAMINEE_TAKEN_EXAM_STATUS_LABEL: Record<
  ExamineeTakenExamStatus,
  string
> = {
  [EXAMINEE_TAKEN_EXAM_STATUS.NOT_TAKEN_YET]: "Chưa Thi",
  [EXAMINEE_TAKEN_EXAM_STATUS.HAS_TAKEN]: "Đã Thi",
  [EXAMINEE_TAKEN_EXAM_STATUS.CANCELLED]: "Bị Hủy Thi",
};
