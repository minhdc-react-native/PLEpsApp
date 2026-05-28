import {
  IExamType,
  IRawExamType,
  ScoreMinimums,
} from "@/types/exam/exam-type.model";

export function mapExamType(raw: IRawExamType): IExamType {
  const hasTopic = raw.hasTopic === true;
  const hasTraining = raw.hasTraining === true;

  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    hasTopic,
    hasTraining,
    canTakeExam: hasTraining,
    hasPractical: hasTopic && hasTraining,
    canDelete: raw.canDelete ?? false,
    scoreMinimums: raw.scores ?? {},
    isPrimary: raw.isPrimary ?? false,
    parentId: raw.parentId ?? raw.id,
    hasMinutes: raw.hasMinutes ?? false,
    editExamineeSalary: raw.editExamineeSalary ?? false,
    canGenerateExaminees: raw.canGenerateExaminees ?? false,
    autoGenerateInYearPlan: raw.autoGenerateInYearPlan ?? false,
    examineeCanRegister: raw.examineeCanRegister ?? false,
    showLastExam: raw.showLastExam ?? false,
    canPermanentlyPostpone: raw.canPermanentlyPostpone ?? false,
    showInReport: raw.showInReport ?? false,
  };
}

export function hasScoreMinimum(
  minimum: number | null | undefined
): minimum is number {
  return minimum !== null && minimum !== undefined;
}

export function mapScoreMinimums(raw: unknown): ScoreMinimums {
  return (raw as ScoreMinimums | null | undefined) ?? {};
}
