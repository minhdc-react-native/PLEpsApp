import { useData } from "@/hooks/zustand/useData";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { TOPIC_STATUS } from "@/types/exam/enums/topic-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Button, useTheme } from "react-native-paper";
import {
  ExamStageDateRange,
  ExamStageStatus,
} from "./exam-stage-widgets";
import {
  ExamStatusActionCard,
  ExamStatusActionCardStyles,
} from "./exam-status-action-card";

export function TopicRegistrationActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const { colors } = useTheme();
  const hasPassedTopic =
    currentExam.examinee.stage > EXAMINEE_STAGES.TOPIC ||
    currentExam.exam.status > EXAM_STATUS.TOPIC_REGISTRATION ||
    currentExam.examinee.topic.status === TOPIC_STATUS.ACCEPTED;
  const canOpenForm =
    currentExam.examinee.stage >= EXAMINEE_STAGES.TOPIC || hasPassedTopic;
  const openForm = () => {
    router.navigate("/screen/current-exam/topic-registration-form");
  };

  const renderBtn = () => {
    const status = currentExam.examinee.topic.status;
    const label =
      currentExam.examinee.stage < EXAMINEE_STAGES.TOPIC
        ? "Chưa mở"
        : status === TOPIC_STATUS.NO_TOPIC
          ? "Đăng ký ngay"
          : status === TOPIC_STATUS.PENDING
            ? "Đã gửi"
            : status === TOPIC_STATUS.ACCEPTED
              ? "Đã chấp thuận"
              : "Đã bị từ chối";
    const buttonColor =
      status === TOPIC_STATUS.ACCEPTED
        ? "#087A52"
        : status === TOPIC_STATUS.REJECTED
          ? colors.error
          : colors.primary;

    return (
      <Button
        mode="outlined"
        labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
        style={{ borderColor: buttonColor }}
        textColor={buttonColor}
        disabled={!canOpenForm}
        onPress={openForm}
      >
        {label}
      </Button>
    );
  };

  if (!currentExam.exam.examType.hasTopic) return null;

  return (
    <ExamStatusActionCard
      title="Đăng ký đề tài"
      icon="file-document-edit-outline"
      step={2}
      last={false}
      action={renderBtn()}
      info={
        currentExam.examinee.stage < EXAMINEE_STAGES.TOPIC ? (
          <ExamStageStatus label="Chưa mở" />
        ) : (
          <ExamStageStatus
            label={
              currentExam.examinee.topic.status === TOPIC_STATUS.NO_TOPIC
                ? "Chưa có đề tài"
                : currentExam.examinee.topic.status === TOPIC_STATUS.PENDING
                  ? "Đã gửi"
                  : currentExam.examinee.topic.status === TOPIC_STATUS.ACCEPTED
                    ? "Đã chấp thuận"
                    : "Đã bị từ chối"
            }
            tone={
              currentExam.examinee.topic.status === TOPIC_STATUS.ACCEPTED
                ? "success"
                : currentExam.examinee.topic.status === TOPIC_STATUS.REJECTED
                  ? "error"
                  : "neutral"
            }
          />
        )
      }
      active={currentExam.exam.status === EXAM_STATUS.TOPIC_REGISTRATION}
    >
      <ExamStageDateRange
        start={currentExam.exam.topicSchedule.startDate}
        end={currentExam.exam.topicSchedule.endDate}
      />
    </ExamStatusActionCard>
  );
}
