export const TOPIC_STATUS = {
  NO_TOPIC: -1,
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
} as const;

export type TopicStatus = (typeof TOPIC_STATUS)[keyof typeof TOPIC_STATUS];

export const TOPIC_STATUS_LABEL: Record<TopicStatus, string> = {
  [TOPIC_STATUS.PENDING]: "Chờ Duyệt",
  [TOPIC_STATUS.ACCEPTED]: "Chấp Thuận",
  [TOPIC_STATUS.REJECTED]: "Bị Từ Chối",
  [TOPIC_STATUS.NO_TOPIC]: "Chưa Có Đề Tài",
};
