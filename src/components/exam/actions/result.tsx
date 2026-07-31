import { useData } from "@/hooks/zustand/useData";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Badge } from "@/components/badge";
import { ResultStatusBadge } from "../result-status-badge";
import { ExamStatusActionCard } from "./exam-status-action-card";

export function ExamResultActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);

  return (
    <ExamStatusActionCard
      title="Kết quả"
      icon="trophy-outline"
      step={5}
      last
      info={
        currentExam.examinee.stage < EXAMINEE_STAGES.RESULT ? (
          <Badge>Chưa mở</Badge>
        ) : (
          <ResultStatusBadge
            isPassed={currentExam.examinee.education?.isPass}
            score={currentExam.examinee.scores.average ?? undefined}
          />
        )
      }
      active={
        currentExam.exam.status === EXAM_STATUS.ENTER_RESULT ||
        currentExam.exam.status === EXAM_STATUS.ENTER_DECISION ||
        currentExam.exam.status === EXAM_STATUS.COMPLETED
      }
      onPress={
        currentExam.examinee.stage >= EXAMINEE_STAGES.RESULT
          ? () => {
              setItemData({
                id: "null",
                active: true,
                ...currentExam,
              });
              router.navigate("/screen/exam-detail?tab=scores");
            }
          : undefined
      }
    />
  );
}
