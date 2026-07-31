import { ListFields } from "@/components/detail-fields/list-fields";
import { Field } from "@/components/Field";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function EmployeeEducation() {
  const user = useData((state) => state.user);
  const { colors } = useTheme();
  const { formatDate } = helper();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView style={[styles.container]}>
        <ListFields>
          <Field label="Trình độ văn hoá" value={user?.academicLevel ?? ""} />
          <Field
            label="Trình độ lý luận chính trị"
            value={user?.politicalTheoryLevel ?? ""}
          />
          <Field
            label="Trình độ (cao nhất)"
            value={user?.highestAcademicLevel ?? ""}
          />
          <Field label="Học vị (cao nhất)" value={user?.highestDegree ?? ""} />
          <Field label="Ngành nghề đào tạo" value={user?.major ?? ""} />
          <Field label="Hình thức đào tạo" value={user?.educationForm ?? ""} />
          <Field label="Trường đào tạo" value={user?.university ?? ""} />
        </ListFields>
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
