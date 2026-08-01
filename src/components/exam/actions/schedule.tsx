import { useData } from "@/hooks/zustand/useData";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Button } from "react-native-paper";
import {
  ExamStatusActionCard,
  ExamStatusActionCardStyles,
} from "./exam-status-action-card";

export function ExamScheduleActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);
  const openDetail = () => {
    setItemData({
      id: "null",
      active: true,
      ...currentExam,
    });
    router.navigate("/screen/exam-detail?tab=exam-info");
  };

  return (
    <ExamStatusActionCard
      title="Lịch thi"
      icon="calendar-clock-outline"
      step={currentExam.exam.examType.hasTopic && currentExam.exam.examType.hasTraining ? 4 : 3}
      last={false}
      active={currentExam.exam.status === EXAM_STATUS.EXAM}
      action={
        currentExam.examinee.stage >= EXAMINEE_STAGES.SCHEDULE ? (
          <Button
            mode="outlined"
            icon="arrow-right"
            labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
            contentStyle={{ flexDirection: "row-reverse" }}
            onPress={openDetail}
          >
            Xem lịch thi
          </Button>
        ) : undefined
      }
    />
  );
}
