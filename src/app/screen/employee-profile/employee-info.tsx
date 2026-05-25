import { ListFields } from "@/components/detail-fields/list-fields";
import { Field } from "@/components/Field";
import { StarRating } from "@/components/starRating";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { LOGIN_TYPE_LABELS } from "@/types/login-type.enum";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

export default function EmployeeInfo() {
  const user = useData((state) => state.user);
  const { colors } = useTheme();
  const { displayDate } = helper();
  return (
    <View style={{ flex: 1, backgroundColor: colors.elevation.level1 }}>
      <ScrollView style={[styles.container]}>
        <ListFields>
          <Field label="Tên đăng nhập" value={user?.userName ?? ""} />
          <Field
            label="Loại tài khoản"
            value={(LOGIN_TYPE_LABELS as any)[user?.accountType ?? ""] ?? ""}
          />
          <Field label="Họ và tên" value={user?.fullName ?? ""} />
          <Field label="Số hiệu" value={user?.code ?? ""} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Field
              label="Giới tính"
              value={user?.gender === 1 ? "Nam" : "Nữ"}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Icon
                source={user?.gender === 1 ? "gender-male" : "gender-female"}
                size={24}
                color={user?.gender === 1 ? "blue" : "purple"}
              />
            </View>
          </View>

          <Field label="Ngày sinh" value={displayDate(user?.birthDate)} />
          <Field label="Email" value={user?.email ?? ""} />
          <Field label="Số điện thoại" value={user?.phone ?? ""} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Field
              label="Bậc hiện tại"
              value={`${user?.currentRank}/${user?.rankScale}`}
            />
            <StarRating
              value={user?.currentRank ?? 0}
              max={user?.rankScale ?? 0}
            />
          </View>

          <Field label="Phòng ban" value={user?.department?.name ?? ""} />
          <Field label="Tổ nhóm" value={user?.team?.name ?? ""} />
          <Field label="Chức vụ" value={user?.position?.name ?? ""} />
          <Field label="Chuyên môn" value={user?.area?.name ?? ""} />

          <Field label="Ngày tuyển dụng" value={displayDate(user?.hireDate)} />
          <Field
            label="Ngày vào ngành"
            value={displayDate(user?.industryStartDate)}
          />
          <Field
            label="Ngày vào cơ quan"
            value={displayDate(user?.dateOfJoining)}
          />
          <Field
            label="Ngày bổ nhiệm"
            value={displayDate(user?.appointmentDate)}
          />

          <Field label="Phân loại chức danh" value={user?.positionCategory} />
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
});
