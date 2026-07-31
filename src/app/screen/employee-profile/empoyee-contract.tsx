import { ListFields } from "@/components/detail-fields/list-fields";
import { Field } from "@/components/Field";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function EmployeeContract() {
  const user = useData((state) => state.user);
  const { colors } = useTheme();
  const { displayDate } = helper();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView style={[styles.container]}>
        <ListFields>
          <Field label="Số HĐLĐ" value={user?.contractNumber ?? ""} />
          <Field
            label="Ngày hiệu lực HĐ"
            value={displayDate(user?.contractEffectiveDate)}
          />
          <Field label="Tình trạng hợp đồng" value={user?.contractStatus} />
          <Field label="Ngày nghỉ hưu" value={displayDate(user?.retiredDate)} />
          <Field
            label="Ngày nghỉ việc"
            value={displayDate(user?.dateOfLeaving)}
          />
          <Field label="Trình độ quản lý" value={user?.managementLevel ?? ""} />
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
