import { ListFields } from "@/components/detail-fields/list-fields";
import { detailFieldStyles } from "@/components/detail-fields/styles";
import { Field } from "@/components/Field";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

export default function ExamDetailScoresInfo() {
  const itemData = useData((state) => state.itemData) as IEmployeeExamHistory;
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.elevation.level1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ gap: 16 }}>
        <ListFields>
          <Field
            label="Điểm trung bình"
            value={itemData.examinee.scores.averageScore}
          />
          <Field
            label="Điểm an toàn"
            value={itemData.examinee.scores.safetyExamScore}
          />
          <Field
            label="Điểm văn hóa doanh nghiệp"
            value={itemData.examinee.scores.corporateCultureScore}
          />
          <Field
            label="Điểm lý thuyết chuyên môn"
            value={itemData.examinee.scores.professionalScore}
          />
          <Field
            label="Điểm vấn đáp (thực hành)"
            value={itemData.examinee.scores.practicalScore}
          />
        </ListFields>
        <View
          style={{
            gap: 4,
            flexDirection: "row",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Icon source="calendar" size={16} />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="titleMedium">
              Giám khảo ({itemData.examinee.scores.examiners?.length})
            </Text>
          </View>
        </View>
        {itemData.examinee.scores.examiners?.map((examiner, index) => (
          <ListFields key={index}>
            <Field label="Tên giám khảo" value={examiner.name} />
            <Field label="Điểm" value={examiner.score} />
            <Field
              label="Đánh giá"
              value={
                examiner.noteVisible ? (
                  examiner.evaluation
                ) : (
                  <Text style={detailFieldStyles.textError}>
                    Không thể xem đánh giá
                  </Text>
                )
              }
            />
            <Field
              label="Nhận xét"
              value={
                examiner.noteVisible ? (
                  examiner.note
                ) : (
                  <Text style={detailFieldStyles.textError}>
                    Không thể xem nhận xét
                  </Text>
                )
              }
            />
          </ListFields>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
