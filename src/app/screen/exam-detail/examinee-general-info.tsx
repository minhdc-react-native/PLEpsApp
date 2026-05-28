import { ListFields } from "@/components/detail-fields/list-fields";
import { Field } from "@/components/Field";
import { StarRating } from "@/components/starRating";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import * as React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, useTheme } from "react-native-paper";

export default function ExamDetailExamineeGeneralInfo() {
  const itemData = useData((state) => state.itemData) as IEmployeeExamHistory;
  const { colors } = useTheme();
  const { displayDate } = helper();

  return (
    <View style={{ flex: 1, backgroundColor: colors.elevation.level1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ gap: 16 }}>
        {/* Box kết quả */}

        <View style={[styles.resultRow]}>
          <Card
            style={[styles.resultCard, { backgroundColor: colors.background }]}
          >
            <View style={{ gap: 10, alignSelf: "center" }}>
              <Text style={styles.resultLabel}>Điểm TB</Text>
              <Text style={[styles.resultValue, { textAlign: "center" }]}>
                {itemData?.examinee.scores.average ?? "-"}
              </Text>
            </View>
          </Card>
          <Card
            style={[styles.resultCard, { backgroundColor: colors.background }]}
          >
            <View style={{ gap: 10, alignSelf: "center" }}>
              <Text style={[styles.resultLabel, { textAlign: "center" }]}>
                Kết quả
              </Text>
              {itemData?.examinee.isPass !== null && (
                <Badge
                  style={[
                    {
                      alignSelf: "flex-start",
                      backgroundColor: itemData?.examinee.isPass
                        ? "green"
                        : colors.error,
                      paddingHorizontal: 12,
                    },
                  ]}
                  size={28}
                >
                  {itemData?.examinee.isPass ? "Đạt" : "Không đạt"}
                </Badge>
              )}
            </View>
          </Card>
        </View>

        <ListFields>
          <Field
            label="Ngày xét điều kiện"
            value={displayDate(itemData?.examinee.conditionDate)}
          />
          {itemData.exam.examType.editExamineeSalary && (
            <>
              <Field
                label={`Thời gian hưởng lương đến hết ${displayDate(
                  itemData?.exam.eventMonth
                )}`}
                value={itemData.examinee.salaryPeriod}
              />
              <Field
                label="Thời gian nâng lương theo quy định"
                value={`${itemData.examinee.salaryYear} năm`}
              />
            </>
          )}
          <Field
            label="Trình độ (cao nhất)"
            value={
              itemData?.examinee.employee.educationInfo?.highestEducationLevel
            }
          />
        </ListFields>
        <ListFields>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Field
              label="Bậc trước thi"
              value={`${itemData.examinee.employee.rank?.rank}/${itemData.examinee.employee.rank?.rankScale}`}
            />
            <StarRating
              value={itemData.examinee.employee.rank?.rank ?? 0}
              max={itemData.examinee.employee.rank?.rankScale ?? 0}
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
              label="Bậc thi"
              value={`${itemData.examinee.examRank.rank}/${itemData.examinee.examRank.rankScale}`}
            />
            <StarRating
              value={itemData.examinee.examRank.rank ?? 0}
              max={itemData.examinee.examRank.rankScale ?? 0}
            />
          </View>
          <Field label="Bậc sau thi" value={""} />
          <Field
            label="Chức danh cũ"
            value={itemData.examinee.employee.position?.name}
          />
          <Field
            label="Chức danh mới"
            value={
              itemData.examinee.examPosition?.name ??
              itemData.examinee.employee.position?.name
            }
          />
          <Field
            label="Chuyên môn cũ"
            value={itemData.examinee.employee.area?.name}
          />
          <Field
            label="Chuyên môn mới"
            value={
              itemData.examinee.examArea?.name ??
              itemData.examinee.employee.area?.name
            }
          />
        </ListFields>
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
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  resultCard: {
    flex: 1,
    paddingVertical: 16,
  },
  resultLabel: {
    fontWeight: "500",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
