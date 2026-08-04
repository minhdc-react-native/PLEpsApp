import { IEmployee } from "../employee/employee.model";
import { IArea } from "../system/area.model";
import { IPayroll } from "../system/payroll.model";
import { IPosition } from "../system/position.model";
import { IRank } from "../system/rank.model";
import { IDecision, IFinalDecision } from "./decision.model";
import { IExamType, IExamTypeVersion } from "./exam-type.model";
import { ExamRegistrationStatus } from "./enums/exam-registration-status.enum";
import { ExamStatus } from "./enums/exam-status.enum";
import { ExamineeStage } from "./enums/examinee-stage.enum";
import { ExamineeTakenExamStatus } from "./enums/taken-exam-status.enum";
import { IExamineeConditionGroup } from "./examinee-condition.model";
import { IExamineeTopic } from "./topic.model";
import { IExamScoreConfig } from "./score.model";

export interface IExam {
  id: string;
  name: string;
  examType: IExamType;
  examTypeVersionId: string | null;
  examTypeVersion: IExamTypeVersion | null;
  scoreConfig: IExamScoreConfig | null | undefined;
  round: IExamRound | null;
  eventMonth: Date;
  status: ExamStatus;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  regApproval: Partial<IDecision>;
  decision: Partial<IFinalDecision>;
  topicSchedule: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export interface IExaminee extends IExamineeAttempt {
  id: string;
  employee: Partial<IEmployee>;
  regStatus: IExamRegistrationRecord;
  departmentRegStatus: IExamRegistrationRecord | null;
  adminRegStatus: IExamRegistrationRecord | null;
  finalRegStatus: IExamRegistrationRecord | null;
  takenExamStatus: ExamineeTakenExamStatus;
  schedules: Record<string, IExamSubjectSchedule | null>;
  isPass: boolean | null;
  failedColumns?: string[];
  isBelowAverageMinimum?: boolean | null;
  topic: IExamineeTopic;
  scores: IExamScore;
  mentor: Partial<IEmployee> | null;
  education: IExamineeEducation | null;
  stage: ExamineeStage;
}

export interface IExamineeAttempt {
  conditionDate: Date | null;
  salaryPeriod: string;
  salaryYear: number;
  examRank: Partial<IRank>;
  retake: boolean | null;
  conditions: IExamineeConditionGroup[] | null;
  examPosition: Partial<IPosition> | null;
  examArea: Partial<IArea> | null;
  examPayroll: Partial<IPayroll> | null;
}

export interface IExamRegistrationRecord {
  status: ExamRegistrationStatus;
  reason: string | null;
  note: string | null;
}

export interface IExamineeEducation {
  isPass: boolean;
  evaluation: string | null;
}

export interface IExamScore {
  average: number | null;
  [key: string]: number | null | IExaminerScore[] | undefined;
  examiners: IExaminerScore[];
}

export interface IExaminerScore {
  id: string;
  employee: Partial<IEmployee> | null;
  name: string | null;
  scores: Record<string, number | null>;
  evaluation: string | null;
  note: string | null;
  noteVisible: boolean;
}

export interface IEmployeeExam {
  exam: IExam;
  examinee: IExaminee;
}

export interface IEmployeeExamHistory extends IEmployeeExam {
  id: string;
  active: boolean;
}

export interface IExamSubjectSchedule {
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  note: string | null;
}

export interface IExamRound {
  id: string;
  round: number;
  name: string;
  eventMonth: Date;
}
