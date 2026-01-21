import { IEmployee } from "../employee/employee.model";
import { IFile } from "../file.model";
import { IArea } from "../system/area.model";
import { TopicStatus } from "./enums/topic-status.enum";

export interface ITopic {
  name: string;
  description: string;
  area: Partial<IArea>;
}

export interface ITopicHistory extends ITopic {
  rejectedBy: Partial<IEmployee> | null;
  rejectedAt: Date | null;
  reason: string | null;
}

export interface IExamineeTopic {
  id: string | null;
  file: Partial<IFile> | null;
  activeTopic: ITopic | null;
  history: ITopicHistory[];
  status: TopicStatus | null;
}
