export interface INoti {
  id: string;
  title: string;
  body: string;
  sendAt: Date;
  isRead: boolean;
  metadata: INotiMetadata;
}

export interface INotiStatistic {
  unread: number;
}

export const NOTI_DATA_KEYS = {
  EXAM_PLAN: 'exam-plan',
} as const;

export type NotiDataKey = (typeof NOTI_DATA_KEYS)[keyof typeof NOTI_DATA_KEYS];

export interface INotiMetadataItem {
  key: NotiDataKey;
  content: string;
}

export type INotiMetadata = Record<string, INotiMetadataItem>;
