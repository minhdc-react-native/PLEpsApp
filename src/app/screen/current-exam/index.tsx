import ExamSvg from "@/assets/images/illustrations/exam.svg";
import { ExamRegistrationActionCard } from "@/components/exam/actions/exam-registration";
import { ExamResultActionCard } from "@/components/exam/actions/result";
import { ExamScheduleActionCard } from "@/components/exam/actions/schedule";
import { TopicRegistrationActionCard } from "@/components/exam/actions/topic-registration";
import { ExamTrainingActionCard } from "@/components/exam/actions/training";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExamRegistrationScreen() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View style={[stypes.container, { paddingTop: top + 12 }]}>
      <ExamSvg width={256} height={256} />
      <View
        style={{
          flexDirection: "row",
          alignSelf: "stretch",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "column",
            gap: 4,
            flex: 1,
            marginRight: 8,
          }}
        >
          <Text>Kỳ thi hiện tại</Text>
          <Text
            variant="titleLarge"
            style={{
              fontWeight: "bold",
              color: colors.primary,
              flexShrink: 1,
              flexWrap: "wrap",
            }}
          >
            {currentExam.exam.name}
          </Text>
        </View>

        <View style={{ width: 24, alignItems: "flex-end" }}>
          <IconButton
            icon="eye"
            mode="contained-tonal"
            size={20}
            onPress={() => {
              setItemData({
                id: "null",
                active: true,
                ...currentExam,
              });
              router.navigate("/screen/exam-detail");
            }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "column",
          alignSelf: "stretch",
          gap: 16,
        }}
      >
        <ExamRegistrationActionCard />
        <TopicRegistrationActionCard />
        <ExamTrainingActionCard />
        <ExamScheduleActionCard />
        <ExamResultActionCard />
      </View>
    </View>
  );
}

const stypes = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
