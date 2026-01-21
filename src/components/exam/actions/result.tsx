import { useData } from "@/hooks/zustand/useData";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { ResultStatusBadge } from "../result-status-badge";
import { ExamStatusActionCard } from "./exam-status-action-card";

export function ExamResultActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);

  if (currentExam.examinee.stage < EXAMINEE_STAGES.RESULT) return null;

  return (
    <ExamStatusActionCard
      title="Kết quả"
      info={
        <ResultStatusBadge
          isPassed={currentExam.examinee.education?.isPass}
          score={currentExam.examinee.scores.averageScore ?? undefined}
        />
      }
      onPress={() => {
        setItemData({
          id: "null",
          active: true,
          ...currentExam,
        });
        router.navigate("/screen/exam-detail?tab=scores");
      }}
    />
  );
}
