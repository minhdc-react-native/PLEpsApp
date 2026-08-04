import { IEmployeeExam } from "@/types/exam/exam.model";
import { Badge } from "../badge";

export function ScheduleStatusBadge({ data }: { data: IEmployeeExam }) {
  const hasSchedule =
    Object.values(data.examinee.schedules).some((schedule) => schedule !== null);

  return (
    <Badge variant={hasSchedule ? "success" : "default"}>
      {hasSchedule ? "Đã có lịch thi" : "Chưa có lịch thi"}
    </Badge>
  );
}
