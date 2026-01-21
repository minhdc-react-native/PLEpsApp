import { TopicStatus } from "@/types/exam/enums/topic-status.enum";
import { IExamineeTopic } from "@/types/exam/topic.model";
import { mapAreaShort } from "../area.mapper";

export function mapExamineeTopic(
  schema: any | null | undefined
): IExamineeTopic {
  if (!schema)
    return {
      id: null,
      file: null,
      activeTopic: null,
      history: [],
      status: null,
    };

  return {
    id: schema.id,
    file: schema.fileId
      ? {
          id: schema.fileId ?? null,
        }
      : null,
    activeTopic: schema.title
      ? {
          name: schema.title,
          description: schema.description,
          area: mapAreaShort(schema.area),
        }
      : null,
    history: schema.historyRejection
      .map((history: any) => ({
        name: history.title,
        description: history.description,
        area: mapAreaShort(history.area),
        rejectedBy: {
          id: history.rejectedBy,
          fullName: history.rejectedByName,
        },
        rejectedAt: history.rejectedAt,
        reason: history.reason,
      }))
      .reverse(),
    status: schema.status as TopicStatus,
  };
}
