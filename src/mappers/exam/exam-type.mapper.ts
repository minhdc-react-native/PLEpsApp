import { mapFile } from "../file.mapper";
import {
  IExamType,
  IExamTypeVersion,
  IRawExamType,
} from "@/types/exam/exam-type.model";
import {
  IExamScoreColumn,
  IExamScoreConfig,
} from "@/types/exam/score.model";

function mapScoreColumns(schema: any): IExamScoreColumn[] {
  return (schema?.scoreColumns ?? []).map((column: any) => ({
    id: column.id,
    key: column.key,
    name: column.name,
    minimumScore: column.minimumScore,
    canExaminerScore: column.canExaminerScore,
  }));
}

function mapFiles(files: any[] | null | undefined) {
  return (files ?? [])
    .filter((file) => typeof file !== "string")
    .map((file) => (file?.fileId ? mapFile(file) : file));
}

export function mapExamTypeVersion(schema: any): IExamTypeVersion {
  return {
    id: String(schema.id),
    name: schema.name,
    active: schema.active === true,
    activatedDate: schema.activatedDate ?? null,
    scoreColumns: mapScoreColumns(schema),
    averageScoreMinimum: schema.averageScoreMinimum ?? null,
    averageScoreFormula: schema.averageScoreFormula ?? null,
    files: mapFiles(schema.files),
  };
}

export function mapExamScoreConfig(
  schema: any
): IExamScoreConfig | null | undefined {
  if (schema === undefined) return undefined;
  if (schema === null) return null;

  return {
    scoreColumns: mapScoreColumns(schema),
    averageScoreMinimum: schema.averageScoreMinimum ?? null,
    averageScoreFormula: schema.averageScoreFormula ?? null,
    files: mapFiles(schema.files),
  };
}

export function mapExamType(raw: IRawExamType): IExamType {
  const versions = (raw.versions ?? []).map((version) =>
    mapExamTypeVersion(version)
  );
  const activeVersion = raw.activeVersion
    ? mapExamTypeVersion(raw.activeVersion)
    : versions.find((version) => version.active) ?? null;

  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    hasTopic: raw.hasTopic === true,
    hasTraining: raw.hasTraining === true,
    canTakeExam: raw.hasTraining === true,
    hasPractical: raw.hasTopic === true && raw.hasTraining === true,
    canDelete: raw.canDelete === true,
    versions,
    activeVersion,
    isPrimary: raw.isPrimary === true,
    parentId: raw.parentId ?? raw.id,
    hasMinutes: raw.hasMinutes === true,
    editExamineeSalary: raw.editExamineeSalary === true,
    canGenerateExaminees: raw.canGenerateExaminees === true,
    autoGenerateInYearPlan: raw.autoGenerateInYearPlan === true,
    examineeCanRegister: raw.examineeCanRegister === true,
    showLastExam: raw.showLastExam === true,
    canPermanentlyPostpone: raw.canPermanentlyPostpone === true,
    showInReport: raw.showInReport === true,
  };
}
