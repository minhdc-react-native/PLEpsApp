import { getFinalStatus } from "@/helpers/exam.helpder";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { EXAM_REGISTRATION_STATUS } from "@/types/exam/enums/exam-registration-status.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { ExamRegistrationStatusBadge } from "../exam-registration-status-badge";
import {
  ExamStatusActionCard,
  ExamStatusActionCardStyles,
} from "./exam-status-action-card";

export function ExamRegistrationActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const { displayDatetime } = helper();

  if (!currentExam.exam.examType.examineeCanRegister) return null;

  const renderBtn = () => {
    const now = new Date();

    if (
      currentExam.exam.status < EXAM_STATUS.REGISTRATION ||
      !currentExam.exam.registrationStartDate ||
      now < new Date(currentExam.exam.registrationStartDate)
    )
      return (
        <Button
          mode="contained"
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
          mode="contained"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          disabled
        >
          Đã kết thúc
        </Button>
      );

    if (
      currentExam.examinee.regStatus.status !== EXAM_REGISTRATION_STATUS.PENDING
    ) {
      return (
        <Button
          mode="contained"
          icon="check"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          disabled
        >
          Đã xác nhận
        </Button>
      );
    }

    if (
      currentExam.examinee.regStatus.status === EXAM_REGISTRATION_STATUS.PENDING
    )
      return (
        <Button
          mode="contained"
          icon="arrow-right"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          contentStyle={{ flexDirection: "row-reverse" }}
          onPress={() => {
            router.navigate("/screen/current-exam/exam-registration-form");
          }}
        >
          Đăng ký ngay
        </Button>
      );
  };

  return (
    <ExamStatusActionCard
      title="Đăng ký tham gia"
      action={renderBtn()}
      info={
        <ExamRegistrationStatusBadge
          status={getFinalStatus(currentExam.examinee)}
        />
      }
      active={currentExam.exam.status === EXAM_STATUS.REGISTRATION}
    >
      <View style={{ gap: 4 }}>
        <View style={{ gap: 4, flexDirection: "row", alignItems: "center" }}>
          <Icon source="calendar" size={16} />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Từ: </Text>
            <Text>
              {displayDatetime(currentExam.exam.registrationStartDate, "--")}
            </Text>
          </View>
        </View>
        <View style={{ gap: 4, flexDirection: "row", alignItems: "center" }}>
          <Icon source="calendar" size={16} />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Đến: </Text>
            <Text>
              {displayDatetime(currentExam.exam.registrationEndDate, "--")}
            </Text>
          </View>
        </View>
      </View>
    </ExamStatusActionCard>
  );
}
