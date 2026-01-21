import {
  TOPIC_STATUS,
  TOPIC_STATUS_LABEL,
  TopicStatus,
} from "@/types/exam/enums/topic-status.enum";
import { Badge } from "../badge";
export function TopicStatusBadge({ status }: { status: TopicStatus | null }) {
  const variant = () => {
    switch (status) {
      case TOPIC_STATUS.ACCEPTED:
        return "success";
      case TOPIC_STATUS.REJECTED:
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Badge variant={variant()}>
      {status !== null ? TOPIC_STATUS_LABEL[status] : "Chưa có đề tài"}
    </Badge>
  );
}
