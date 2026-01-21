import { Field } from "@/components/Field";
import { StarRating } from "@/components/starRating";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { EXAM_TYPE_LABELS } from "@/types/exam/enums/exam-type.enum";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar, Card, Divider, Text, useTheme } from "react-native-paper";

const ContestInfo = () => {
  const { colors } = useTheme();
  const currentExam = useData((state) => state.currentExam);
  const { formatDate } = helper();
  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Thông tin dự thi" />
      </Appbar.Header>
      <ScrollView style={[styles.container]}>
        <Card style={{ padding: 20, backgroundColor: colors.background }}>
          <Text
            style={{
              fontWeight: "bold",
              color: colors.secondary,
              textAlign: "center",
            }}
          >
            {currentExam?.employeeExamPeriod?.name}
          </Text>
          <Divider style={{ marginVertical: 10 }} />
          <Field
            label="Loại"
            value={`${
              (EXAM_TYPE_LABELS as any)[
                currentExam?.employeeExamPeriod?.examType?.code
              ]
            }`}
          />
          <Field
            label="Thời gian"
            value={`${formatDate(
              currentExam?.employeeExamPeriod?.registrationStartDate
            )} - ${formatDate(
              currentExam?.employeeExamPeriod?.registrationEndDate
            )}`}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Field
              label="Bậc thợ trước thi"
              value={`${currentExam?.examRegistration?.currentRank}/${currentExam?.examRegistration?.rankScale}`}
            />
            <StarRating
              value={currentExam?.examRegistration?.currentRank ?? 0}
              max={currentExam?.examRegistration?.rankScale ?? 0}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Field
              label="Bậc thợ thi"
              value={`${currentExam?.examRegistration?.examRank}/${currentExam?.examRegistration?.rankScale}`}
            />
            <StarRating
              value={currentExam?.examRegistration?.examRank ?? 0}
              max={currentExam?.examRegistration?.rankScale ?? 0}
            />
          </View>
        </Card>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ContestInfo;
