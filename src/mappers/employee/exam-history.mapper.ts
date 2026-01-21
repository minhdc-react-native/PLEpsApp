import { IEmployeeExam } from "@/types/exam/exam.model";
import { mapExam, mapExaminee } from "../exam/exam.mapper";

export function mapEmployeeExamHistory(schema: any): IEmployeeExam {
  const exam = mapExam(schema.employeeExamPeriod);
  const examinee = mapExaminee(schema.examRegistration);

  return {
    examinee: examinee,
    exam: {
      ...exam,
      decision: {
        number: schema.number,
        signedDate: schema.signedDate,
        effectiveDate: schema.effectiveDate,
        file: schema.fileId && {
          id: schema.fileId || undefined,
        },
      },
    },
  };
}
