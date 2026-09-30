import { mapEmployeeExamHistory } from "@/mappers/employee/exam-history.mapper";
import type { IEmployeeExam } from "@/types/exam/exam.model";
import { api } from "@/utils/epsApi";

export type EmployeeExamPeriodMenuItem = IEmployeeExam;

export async function getEmployeeExamPeriodsApi(
  employeeId: string,
): Promise<EmployeeExamPeriodMenuItem[]> {
  const response: any = await api.get({
    link: `/exams/employee/${employeeId}/exam-periods`,
  });
  return (response?.returnData ?? []).map(mapEmployeeExamHistory);
}
