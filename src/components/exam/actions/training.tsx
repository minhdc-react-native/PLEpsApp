import { useData } from "@/hooks/zustand/useData";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Badge } from "@/components/badge";
import { TrainingStatusBadge } from "../training-status-badge";
import { ExamStatusActionCard } from "./exam-status-action-card";

export function ExamTrainingActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);

  if (!currentExam.exam.examType.hasTraining) return null;

  return (
    <ExamStatusActionCard
      title="Đào tạo"
      icon="school-outline"
      step={currentExam.exam.examType.hasTopic ? 3 : 2}
      last={false}
      info={
        currentExam.examinee.stage < EXAMINEE_STAGES.EDUCATION ? (
          <Badge>Chưa mở</Badge>
        ) : (
          <TrainingStatusBadge isPassed={currentExam.examinee.education?.isPass} />
        )
      }
      active={currentExam.exam.status === EXAM_STATUS.EDUCATION_RESULT}
      onPress={
        currentExam.examinee.stage >= EXAMINEE_STAGES.EDUCATION
          ? () => {
              setItemData({
                id: "null",
                active: true,
                ...currentExam,
              });
              router.navigate("/screen/exam-detail?tab=education");
            }
          : undefined
      }
    />
  );
}
