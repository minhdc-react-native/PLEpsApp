import { ListFields } from "@/components/detail-fields/list-fields";
import { detailFieldStyles } from "@/components/detail-fields/styles";
import DetailSectionHeader from "@/components/detail-section-header";
import { Field } from "@/components/Field";
import { useData } from "@/hooks/zustand/useData";
import { hasScoreMinimum } from "@/mappers/exam/exam-type.mapper";
import { ScoreKey } from "@/types/exam/exam-type.model";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ExamDetailScoresInfo() {
  const itemData = useData((state) => state.itemData) as IEmployeeExamHistory;
  const { colors } = useTheme();
  const scoreFields: { key: ScoreKey; label: string }[] = [
    { key: "average", label: "Điểm trung bình" },
    { key: "at", label: "Điểm an toàn" },
    { key: "vhdn", label: "Điểm văn hóa doanh nghiệp" },
    { key: "ltcm", label: "Điểm lý thuyết chuyên môn" },
    { key: "th", label: "Điểm vấn đáp (thực hành)" },
  ];
  const configuredScores = scoreFields.filter(({ key }) =>
    hasScoreMinimum(itemData.exam.examType.scoreMinimums[key])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={{ gap: 16 }}>
        <ListFields>
          {configuredScores.map(({ key, label }) => (
            <Field key={key} label={label} value={itemData.examinee.scores[key]} />
          ))}
        </ListFields>
        {itemData.exam.examType.hasPractical && (
          <DetailSectionHeader
            icon="calendar"
            title={`Giám khảo (${itemData.examinee.scores.examiners.length})`}
          />
        )}
        {itemData.exam.examType.hasPractical &&
          itemData.examinee.scores.examiners.map((examiner, index) => (
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
  },
});
