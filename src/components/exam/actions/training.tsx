import { useData } from "@/hooks/zustand/useData";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { TrainingStatusBadge } from "../training-status-badge";
import { ExamStatusActionCard } from "./exam-status-action-card";

export function ExamTrainingActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);

  if (currentExam.examinee.stage < EXAMINEE_STAGES.EDUCATION) return null;

  return (
    <ExamStatusActionCard
      title="Đào tạo"
      info={
        <TrainingStatusBadge
          isPassed={currentExam.examinee.education?.isPass}
        />
      }
      onPress={() => {
        setItemData({
          id: "null",
          active: true,
          ...currentExam,
        });
        router.navigate("/screen/exam-detail?tab=education");
      }}
    />
  );
}
