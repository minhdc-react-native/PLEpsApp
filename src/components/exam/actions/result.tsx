import { useData } from "@/hooks/zustand/useData";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Button } from "react-native-paper";
import { ExamStageStatus } from "./exam-stage-widgets";
import {
  ExamStatusActionCard,
  ExamStatusActionCardStyles,
} from "./exam-status-action-card";

export function ExamResultActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);
  const openDetail = () => {
    setItemData({
      id: "null",
      active: true,
      ...currentExam,
    });
    router.navigate("/screen/exam-detail?tab=scores");
  };

  return (
    <ExamStatusActionCard
      title="Kết quả"
      icon="trophy-outline"
      step={5}
      last
      info={
        <ExamStageStatus
          label={
            currentExam.examinee.stage < EXAMINEE_STAGES.RESULT
              ? "Chưa mở"
              : currentExam.examinee.education?.isPass === true
                ? `Đạt${currentExam.examinee.scores.average !== null ? ` · ${currentExam.examinee.scores.average}` : ""}`
                : currentExam.examinee.education?.isPass === false
                  ? `Không đạt${currentExam.examinee.scores.average !== null ? ` · ${currentExam.examinee.scores.average}` : ""}`
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
      active={
        currentExam.exam.status === EXAM_STATUS.ENTER_RESULT ||
        currentExam.exam.status === EXAM_STATUS.ENTER_DECISION ||
        currentExam.exam.status === EXAM_STATUS.COMPLETED
      }
      action={
        currentExam.examinee.stage >= EXAMINEE_STAGES.RESULT ? (
          <Button
            mode="outlined"
            icon="arrow-right"
            labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
            contentStyle={{ flexDirection: "row-reverse" }}
            onPress={openDetail}
          >
            Xem kết quả
          </Button>
        ) : undefined
      }
    />
  );
}
