import { useData } from "@/hooks/zustand/useData";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { ScheduleStatusBadge } from "../schedule-status-badge";
import { ExamStatusActionCard } from "./exam-status-action-card";

export function ExamScheduleActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);

  if (currentExam.examinee.stage < EXAMINEE_STAGES.SCHEDULE) return null;

  return (
    <ExamStatusActionCard
      title="Lịch thi"
      info={<ScheduleStatusBadge data={currentExam} />}
      onPress={() => {
        setItemData({
          id: "null",
          active: true,
          ...currentExam,
        });
        router.navigate("/screen/exam-detail?tab=exam-info");
      }}
    />
  );
}
