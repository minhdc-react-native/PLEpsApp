export type SubjectKey = "at" | "vhdn" | "ltcm" | "th";
export type ScoreKey = "average" | SubjectKey;
export type ScoreMinimums = Partial<Record<ScoreKey, number | null>>;

export interface IExamType {
  id: string;
  code: string;
  name: string;
  hasTopic: boolean;
  hasTraining: boolean;
  canTakeExam: boolean;
  hasPractical: boolean;
  canDelete: boolean;
  scoreMinimums: ScoreMinimums;
  isPrimary: boolean;
  parentId: string;
  hasMinutes: boolean;
  editExamineeSalary: boolean;
  canGenerateExaminees: boolean;
  autoGenerateInYearPlan: boolean;
  examineeCanRegister: boolean;
  showLastExam: boolean;
  canPermanentlyPostpone: boolean;
  showInReport: boolean;
}

export interface IRawExamType {
  id: string;
  code: string;
  name: string;
  hasTopic?: boolean;
  hasTraining?: boolean;
  canDelete?: boolean;
  scores?: ScoreMinimums;
  isPrimary?: boolean;
  parentId?: string | null;
  hasMinutes?: boolean;
  editExamineeSalary?: boolean;
  canGenerateExaminees?: boolean;
  autoGenerateInYearPlan?: boolean;
  examineeCanRegister?: boolean;
  showLastExam?: boolean;
  canPermanentlyPostpone?: boolean;
  showInReport?: boolean;
}
