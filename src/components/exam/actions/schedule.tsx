import { useData } from "@/hooks/zustand/useData";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Badge } from "@/components/badge";
import { ScheduleStatusBadge } from "../schedule-status-badge";
import { ExamStatusActionCard } from "./exam-status-action-card";

export function ExamScheduleActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);

  return (
    <ExamStatusActionCard
      title="Lịch thi"
      icon="calendar-clock-outline"
      step={currentExam.exam.examType.hasTopic && currentExam.exam.examType.hasTraining ? 4 : 3}
      last={false}
      info={
        currentExam.examinee.stage < EXAMINEE_STAGES.SCHEDULE ? (
          <Badge>Chưa mở</Badge>
        ) : (
          <ScheduleStatusBadge data={currentExam} />
        )
      }
      active={currentExam.exam.status === EXAM_STATUS.EXAM}
      onPress={
        currentExam.examinee.stage >= EXAMINEE_STAGES.SCHEDULE
          ? () => {
              setItemData({
                id: "null",
                active: true,
                ...currentExam,
              });
              router.navigate("/screen/exam-detail?tab=exam-info");
            }
          : undefined
      }
    />
  );
}
