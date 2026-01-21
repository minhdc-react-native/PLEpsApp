import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { TOPIC_STATUS } from "@/types/exam/enums/topic-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { TopicStatusBadge } from "../topic-status-badge";
import {
  ExamStatusActionCard,
  ExamStatusActionCardStyles,
} from "./exam-status-action-card";

export function TopicRegistrationActionCard() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const { displayDatetime } = helper();

  const renderBtn = () => {
    const now = new Date();
    if (
      currentExam.exam.status < EXAM_STATUS.TOPIC_REGISTRATION ||
      !currentExam.exam.topicSchedule.startDate ||
      now < new Date(currentExam.exam.topicSchedule.startDate)
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
      currentExam.exam.status > EXAM_STATUS.TOPIC_REGISTRATION ||
      !currentExam.exam.topicSchedule.endDate ||
      now > new Date(currentExam.exam.topicSchedule.endDate)
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

    if (currentExam.examinee.topic.status === TOPIC_STATUS.ACCEPTED)
      return (
        <Button
          mode="contained"
          labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
          disabled
        >
          Đã chấp thuận
        </Button>
      );

    return (
      <Button
        mode="contained"
        icon="arrow-right"
        labelStyle={ExamStatusActionCardStyles.actionBtnLabel}
        contentStyle={{ flexDirection: "row-reverse" }}
        onPress={() => {
          router.navigate("/screen/current-exam/topic-registration-form");
        }}
      >
        Cập nhật
      </Button>
    );
  };

  if (currentExam.examinee.stage < EXAMINEE_STAGES.TOPIC) return null;

  return (
    <ExamStatusActionCard
      title="Đăng ký đề tài"
      action={renderBtn()}
      info={<TopicStatusBadge status={currentExam.examinee.topic.status} />}
      active={currentExam.exam.status === EXAM_STATUS.TOPIC_REGISTRATION}
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
              {displayDatetime(currentExam.exam.topicSchedule.startDate, "--")}
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
              {displayDatetime(currentExam.exam.topicSchedule.endDate, "--")}
            </Text>
          </View>
        </View>
      </View>
    </ExamStatusActionCard>
  );
}
