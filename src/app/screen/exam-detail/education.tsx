import { Badge } from "@/components/badge";
import { ListFields } from "@/components/detail-fields/list-fields";
import { Field } from "@/components/Field";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ExamDetailEducationInfo() {
  const itemData = useData((state) => state.itemData) as IEmployeeExamHistory;
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {itemData.examinee.education !== null ? (
        <ScrollView style={styles.container}>
          <ListFields>
            <Field
              label="Kết quả bồi huấn"
              value={
                itemData.examinee.education.isPass ? (
                  <Badge variant="success">Đạt</Badge>
                ) : (
                  <Badge variant="error">Không Đạt</Badge>
                )
              }
            />
            <Field
              label="Đánh giá"
              value={itemData.examinee.education.evaluation}
            />
          </ListFields>
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 100,
          }}
        >
          <Text>Thí sinh chưa có kết quả bồi huấn</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
