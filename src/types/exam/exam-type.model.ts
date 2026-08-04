import { IFile } from "../file.model";
import { IExamScoreColumn } from "./score.model";

export interface IExamTypeVersion {
  id: string;
  name: string;
  active: boolean;
  activatedDate: Date | null;
  scoreColumns: IExamScoreColumn[];
  averageScoreMinimum: number | null | undefined;
  averageScoreFormula: string | null | undefined;
  files: IFile[];
}

export interface IExamType {
  id: string;
  code: string;
  name: string;
  hasTopic: boolean;
  hasTraining: boolean;
  canTakeExam: boolean;
  hasPractical: boolean;
  canDelete: boolean;
  versions: IExamTypeVersion[];
  activeVersion: IExamTypeVersion | null;
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
  versions?: unknown[];
  activeVersion?: unknown | null;
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
