import { Field } from "@/components/Field";
import DetailSectionHeader from "@/components/detail-section-header";
import { ListFields } from "@/components/detail-fields/list-fields";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function EmployeeInternalExpert() {
  const user = useData((state) => state.user);
  const { colors } = useTheme();
  const { displayDate } = helper();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <DetailSectionHeader title="Thông tin chuyên gia nội bộ" />
        <ListFields>
          <Field
            label="Trạng thái"
            value={user?.isExpert ? "Chuyên gia nội bộ" : "Chưa đăng ký"}
          />
          <Field label="Họ và tên" value={user?.fullName ?? ""} />
          <Field label="Số hiệu" value={user?.code ?? ""} />
          <Field
            label="Đơn vị"
            value={user?.department?.name ?? user?.team?.name ?? ""}
          />
          <Field label="Chức danh" value={user?.position?.name ?? ""} />
          <Field label="Ngày thêm" value={displayDate(user?.expertDate)} />
          <Field
            label="Ngày phê duyệt"
            value={displayDate(user?.approvedAt)}
          />
        </ListFields>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  bottomSpace: { height: 24 },
});
