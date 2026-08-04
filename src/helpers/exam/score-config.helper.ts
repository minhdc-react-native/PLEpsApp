import { IExamType, IExamTypeVersion } from "@/types/exam/exam-type.model";
import { IExam } from "@/types/exam/exam.model";
import {
  IExamScoreColumn,
  IExamScoreConfig,
} from "@/types/exam/score.model";

export function getExamTypeVersionConfig(
  examType: IExamType,
  version?: IExamTypeVersion | null
): IExamScoreConfig {
  const selectedVersion = version ?? examType.activeVersion;

  return {
    scoreColumns: selectedVersion?.scoreColumns ?? [],
    averageScoreMinimum: selectedVersion?.averageScoreMinimum,
    averageScoreFormula: selectedVersion?.averageScoreFormula,
    files: selectedVersion?.files ?? [],
  };
}

export function getExamScoreConfig(exam: IExam): IExamScoreConfig {
  return exam.scoreConfig ?? getExamTypeVersionConfig(exam.examType, exam.examTypeVersion);
}

export function getExaminerScoreColumns(
  config: IExamScoreConfig
): IExamScoreColumn[] {
  return config.scoreColumns.filter((column) => column.canExaminerScore);
}

export function shouldShowAverageScore(config: IExamScoreConfig): boolean {
  return (
    config.averageScoreFormula !== null &&
    config.averageScoreFormula !== undefined &&
    config.averageScoreFormula.length > 0
  ) || config.averageScoreMinimum !== null && config.averageScoreMinimum !== undefined;
}

export function getScoreValue(
  scores: Record<string, unknown>,
  key: string
): number | null {
  const value = scores[key];
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "score" in value) {
    const score = (value as { score?: unknown }).score;
    return typeof score === "number" ? score : null;
  }
  return null;
}

export function formatExamScoreFormula(
  formula: string | null | undefined,
  config: IExamScoreConfig
): string | null {
  if (!formula) return null;

  const labels = new Map(
    config.scoreColumns.map((column) => [column.key, column.name])
  );
  return formula.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (token) => labels.get(token) ?? token);
}
