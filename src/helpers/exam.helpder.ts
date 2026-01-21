import { ExamRegistrationStatus } from "@/types/exam/enums/exam-registration-status.enum";
import { IExaminee } from "@/types/exam/exam.model";

export function getFinalStatus(examinee: IExaminee): ExamRegistrationStatus {
  return (
    examinee.finalRegStatus?.status ??
    examinee.adminRegStatus?.status ??
    examinee.departmentRegStatus?.status ??
    examinee.regStatus.status
  );
}
