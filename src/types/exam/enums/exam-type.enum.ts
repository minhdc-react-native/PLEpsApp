export const EXAM_TYPES = {
  NANG_BAC: "NB",
  GIU_BAC: "GB",
  THI_LAI_GIU_BAC: "TLGB",
  KTSHN: "KTSHN",
  NANG_LUONG: "NL",
  NANG_NGACH: "NN",
  CHUYEN_NGACH: "CN",
} as const;

export type ExamType = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES];

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  [EXAM_TYPES.NANG_BAC]: "Nâng Bậc",
  [EXAM_TYPES.GIU_BAC]: "Giữ Bậc",
  [EXAM_TYPES.THI_LAI_GIU_BAC]: "Thi Lại Giữ Bậc",
  [EXAM_TYPES.KTSHN]: "Kiểm Tra Sát Hoạch Nghề",
  [EXAM_TYPES.NANG_LUONG]: "Nâng Lương",
  [EXAM_TYPES.NANG_NGACH]: "Nâng Ngạch",
  [EXAM_TYPES.CHUYEN_NGACH]: "Chuyển Ngạch",
};
