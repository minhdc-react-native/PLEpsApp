import { useData } from "@/hooks/zustand/useData";
import {
  EXAM_REGISTRATION_STATUS,
  EXAM_REGISTRATION_STATUS_LABELS,
} from "@/types/exam/enums/exam-registration-status.enum";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { Button } from "react-native-paper";
import {
  ExamStageDateRange,
  ExamStageStatus,
} from "./exam-stage-widgets";
import {
  ExamStatusActionCard,
  ExamStatusActionCardStyles,
} from "./exam-status-action-card";

export function ExamRegistrationActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const now = new Date();
  const hasPassedRegistration =
    currentExam.examinee.stage > EXAMINEE_STAGES.REGISTRATION ||
    currentExam.exam.status > EXAM_STATUS.REGISTRATION ||
    currentExam.examinee.regStatus.status !== EXAM_REGISTRATION_STATUS.PENDING;
  const registrationStatus = currentExam.examinee.regStatus.status;
  const openForm = () => {
    router.navigate("/screen/current-exam/exam-registration-form");
  };

  if (!currentExam.exam.examType.examineeCanRegister) {
    return (
      <ExamStatusActionCard
        title="Đăng ký tham gia"
        icon="account-plus-outline"
        step={1}
        info={<ExamStageStatus label="Chưa mở" />}
      />
    );
  }

  const renderBtn = () => {
    if (hasPassedRegistration) {
      const label =
        registrationStatus === EXAM_REGISTRATION_STATUS.PENDING
          ? "Xem đăng ký"
          : EXAM_REGISTRATION_STATUS_LABELS[registrationStatus];
      return (
        <Button
          mode="outlined"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          onPress={openForm}
        >
          {label}
        </Button>
      );
    }

    if (
      currentExam.exam.status < EXAM_STATUS.REGISTRATION ||
      !currentExam.exam.registrationStartDate ||
      now < new Date(currentExam.exam.registrationStartDate)
    )
      return (
        <Button
          mode="outlined"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          disabled
        >
          Chưa mở
        </Button>
      );

    if (
      currentExam.exam.status > EXAM_STATUS.REGISTRATION ||
      !currentExam.exam.registrationEndDate ||
      now > new Date(currentExam.exam.registrationEndDate)
    )
      return (
        <Button
          mode="outlined"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          disabled
        >
          Đã kết thúc
        </Button>
      );

    if (
      currentExam.examinee.regStatus.status === EXAM_REGISTRATION_STATUS.PENDING
    )
      return (
        <Button
          mode="contained"
          icon="arrow-right"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          contentStyle={{ flexDirection: "row-reverse" }}
          onPress={openForm}
        >
          Đăng ký ngay
        </Button>
      );
  };

  return (
    <ExamStatusActionCard
      title="Đăng ký tham gia"
      icon="account-plus-outline"
      step={1}
      first
      last={false}
      action={renderBtn()}
      info={
        <ExamStageStatus
          label={EXAM_REGISTRATION_STATUS_LABELS[registrationStatus]}
          tone={
            registrationStatus === EXAM_REGISTRATION_STATUS.SIGNED ||
            registrationStatus === EXAM_REGISTRATION_STATUS.ADDED
              ? "success"
              : registrationStatus === EXAM_REGISTRATION_STATUS.POSTPONED ||
                  registrationStatus === EXAM_REGISTRATION_STATUS.REJECTED
                ? "error"
                : "neutral"
          }
        />
      }
      active={currentExam.exam.status === EXAM_STATUS.REGISTRATION}
    >
      <ExamStageDateRange
        start={currentExam.exam.registrationStartDate}
        end={currentExam.exam.registrationEndDate}
      />
    </ExamStatusActionCard>
  );
}
