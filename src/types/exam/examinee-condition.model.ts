import { IRank } from "../system/rank.model";

export const EXAMINEE_CONDITION_CODES = {
  // NB
  NB_DK1: "NB.DK1",
  NB_DK2: "NB.DK2",
  NB_DK3: "NB.DK3",
  NB_DK4: "NB.DK4",
  NB_DK5: "NB.DK5",
  NB_DK6: "NB.DK6",

  //GB
  GB_DK1: "GB.DK1",
  GB_DK2: "GB.DK2",
  GB_DK3: "GB.DK3",
  GB_DK4: "GB.DK4",
  GB_DK5: "GB.DK5",

  //KTSHN
  KTSHN_DK1: "KTSHN.DK1",
  KTSHN_DK2: "KTSHN.DK2",

  //NL
  NL_DK1: "NL.DK1",
  NL_DK2: "NL.DK2",
} as const;

export type ExamineeConditionCode =
  (typeof EXAMINEE_CONDITION_CODES)[keyof typeof EXAMINEE_CONDITION_CODES];

export interface IExamineeConditionGroup {
  case: string;
  conditions: IExamineeCondition[];
  isMet: boolean;
}

export interface IExamineeCondition {
  code: ExamineeConditionCode;
  isMet: boolean;
  data: IConditionDataProps;
}

export interface IConditionDataProps {
  currentRank?: Partial<IRank>;
  minRankMonth?: number | null;
  rankMonth?: number | null;
  lastGBExamResult?: {
    isPass: boolean;
    examName: string;
  } | null;
  retireDate?: Date | null;
  remainingMonthsOfService?: number | null;
  lastPassedExam?: {
    examName: string;
    monthsAgo: number;
  } | null;
  numOfFailedNB?: number | null;
  remainingGBRetakeMonths?: number | null;
  nextPromotionDate?: Date | null;
  eventMonth?: Date | null;
}
