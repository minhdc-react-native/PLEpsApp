import { useData } from "@/hooks/zustand/useData";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Button } from "react-native-paper";
import { ExamStageStatus } from "./exam-stage-widgets";
import {
  ExamStatusActionCard,
  ExamStatusActionCardStyles,
} from "./exam-status-action-card";

export function ExamTrainingActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);
  const openDetail = () => {
    setItemData({
      id: "null",
      active: true,
      ...currentExam,
    });
    router.navigate("/screen/exam-detail?tab=education");
  };

  if (!currentExam.exam.examType.hasTraining) return null;

  return (
    <ExamStatusActionCard
      title="Đào tạo"
      icon="school-outline"
      step={currentExam.exam.examType.hasTopic ? 3 : 2}
      last={false}
      info={
        <ExamStageStatus
          label={
            currentExam.examinee.stage < EXAMINEE_STAGES.EDUCATION
              ? "Chưa mở"
              : currentExam.examinee.education?.isPass === true
                ? "Đạt"
                : currentExam.examinee.education?.isPass === false
                  ? "Không đạt"
                  : "Chưa có kết quả"
          }
          tone={
            currentExam.examinee.education?.isPass === true
              ? "success"
              : currentExam.examinee.education?.isPass === false
                ? "error"
                : "neutral"
          }
        />
      }
      active={currentExam.exam.status === EXAM_STATUS.EDUCATION_RESULT}
      action={
        currentExam.examinee.stage >= EXAMINEE_STAGES.EDUCATION ? (
          <Button
            mode="outlined"
            icon="arrow-right"
            labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
            contentStyle={{ flexDirection: "row-reverse" }}
            onPress={openDetail}
          >
            Xem đào tạo
          </Button>
        ) : undefined
      }
    />
  );
}
