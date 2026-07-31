import { IEmployeeExam } from "@/types/exam/exam.model";
import { Badge } from "../badge";

export function ScheduleStatusBadge({ data }: { data: IEmployeeExam }) {
  const hasSchedule =
    data.exam.schedules.safetyExam !== null ||
    data.exam.schedules.corporateCulture !== null ||
    data.exam.schedules.professional !== null ||
    (data.exam.examType.hasPractical &&
      data.examinee.schedules.practical !== null);

  return (
    <Badge variant={hasSchedule ? "success" : "default"}>
      {hasSchedule ? "Đã có lịch thi" : "Chưa có lịch thi"}
    </Badge>
  );
}
