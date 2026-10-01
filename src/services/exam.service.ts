import { mapEmployeeExamHistory } from "@/mappers/employee/exam-history.mapper";
import type { IEmployeeExam } from "@/types/exam/exam.model";
import { api } from "@/utils/epsApi";

export type EmployeeExamPeriodMenuItem = IEmployeeExam;

export interface EmployeeExamPeriodsSummary {
  participatingCount: number;
  completedCount: number;
}

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

export async function getEmployeeExamPeriodsApi(
  employeeId: string,
): Promise<EmployeeExamPeriodMenuItem[]> {
  const response: any = await api.get({
    link: `/exams/employee/${employeeId}/exam-periods`,
  });
  return (response?.returnData ?? []).map(mapEmployeeExamHistory);
}

export async function getEmployeeExamPeriodsSummaryApi(
  employeeId: string,
): Promise<EmployeeExamPeriodsSummary> {
  const response: any = await api.get({
    link: `/exams/employee/${employeeId}/exam-periods/summary`,
  });
  const data = response?.returnData ?? response?.data?.returnData ?? {};

  return {
    participatingCount: asCount(data.participatingCount),
    completedCount: asCount(data.completedCount),
  };
}
