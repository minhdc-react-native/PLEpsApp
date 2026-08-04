import { ListFields } from "@/components/detail-fields/list-fields";
import { detailFieldStyles } from "@/components/detail-fields/styles";
import DetailSectionHeader from "@/components/detail-section-header";
import { Field } from "@/components/Field";
import { getExamScoreConfig, getExaminerScoreColumns, getScoreValue, shouldShowAverageScore } from "@/helpers/exam/score-config.helper";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ExamDetailScoresInfo() {
  const itemData = useData((state) => state.itemData) as IEmployeeExamHistory;
  const { colors } = useTheme();
  const config = getExamScoreConfig(itemData.exam);
  const scoreValues = itemData.examinee.scores as Record<string, unknown>;
  const examinerColumns = getExaminerScoreColumns(config);
  const scoreFields = [
    ...(shouldShowAverageScore(config)
      ? [{ key: "average", label: "Điểm trung bình" }]
      : []),
    ...config.scoreColumns.map((column) => ({
      key: column.key,
      label: column.name,
    })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={{ gap: 16 }}>
        <ListFields>
          {scoreFields.map(({ key, label }) => (
            <Field
              key={key}
              label={label}
              value={getScoreValue(scoreValues, key)}
            />
          ))}
        </ListFields>

        {examinerColumns.length > 0 && itemData.examinee.scores.examiners.length > 0 && (
          <>
            <DetailSectionHeader
              icon="account-group-outline"
              title={`Giám khảo (${itemData.examinee.scores.examiners.length})`}
            />
            {itemData.examinee.scores.examiners.map((examiner) => (
              <ListFields key={examiner.id}>
                <Field label="Tên giám khảo" value={examiner.name} />
                {examinerColumns.map((column) => (
                  <Field
                    key={column.key}
                    label={column.name}
                    value={getScoreValue(examiner.scores, column.key)}
                  />
                ))}
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
          </>
        )}
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
