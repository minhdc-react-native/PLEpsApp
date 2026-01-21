import { TOPIC_STATUS } from "@/types/exam/enums/topic-status.enum";
import { IExamineeTopic, ITopicHistory } from "@/types/exam/topic.model";

export function getFullActiveTopic(
  examineeTopic: IExamineeTopic | null | undefined
): ITopicHistory | null {
  if (!examineeTopic) return null;

  if (examineeTopic.status === TOPIC_STATUS.REJECTED) {
    return examineeTopic.history[0];
  }

  return {
    name: examineeTopic.activeTopic?.name ?? "",
    description: examineeTopic.activeTopic?.description ?? "",
    area: examineeTopic.activeTopic?.area ?? {},
    reason: "",
    rejectedAt: null,
    rejectedBy: null,
  };
}
