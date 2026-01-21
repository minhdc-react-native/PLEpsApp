import { ListFields } from "@/components/detail-fields/list-fields";
import { Field } from "@/components/Field";
import { FileBadge } from "@/components/file-badge";
import { StarRating } from "@/components/starRating";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { ISalaryHistory } from "@/types/employee/salary-history.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Divider, useTheme } from "react-native-paper";

export default function SalaryHistoryDetail() {
  const itemData = useData((state) => state.itemData) as ISalaryHistory;
  const { colors } = useTheme();
  const { displayDate, displayDateDiff } = helper();
  return (
    <View style={{ flex: 1, backgroundColor: colors.elevation.level1 }}>
      {/* Appbar */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={`Ngạch ${itemData?.payroll?.code}- Bậc ${itemData.rank?.rank}/${itemData.rank?.rankScale}`}
        />
      </Appbar.Header>
      <Divider />
      {/* Nội dung */}
      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
      >
        <ListFields>
          <Field
            label="Loại"
            value={itemData?.lumpSum === null ? "Lương ngạch" : "Lương khoán"}
          />
          <Field
            label="Ngày hưởng lương"
            value={displayDate(itemData?.startDate)}
          />
          <Field
            label="Đang áp dụng?"
            value={
              itemData?.apply ? (
                <MaterialCommunityIcons name="check" size={24} color="blue" />
              ) : (
                <MaterialCommunityIcons name="close" size={24} color="red" />
              )
            }
          />
          {itemData?.lumpSum === null ? (
            <>
              <Field label="Ngạch lương" value={itemData?.payroll?.code} />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Field
                  label="Bậc lương"
                  value={`${itemData?.rank?.rank}/${itemData?.rank?.rankScale}`}
                />
                <StarRating
                  value={itemData?.rank?.rank ?? 0}
                  max={itemData?.rank?.rankScale ?? 0}
                />
              </View>
              <Field label="Hệ số lương" value={itemData?.coefficient} />
              <Field
                label="Ngày kết thúc hưởng lương"
                value={displayDate(itemData?.endDate)}
              />
              <Field
                label="Thời gian đã hưởng"
                value={displayDateDiff(itemData?.startDate, itemData?.endDate)}
              />
              <Field
                label="Thời gian nâng lương theo quy định"
                value={`${itemData?.yearsForPromotion} năm`}
              />
              <Field
                label="Mốc tính nâng lương"
                value={displayDate(itemData?.markSalaryDate)}
              />
              <Field
                label="Thời gian nâng lương tiếp theo"
                value={displayDate(itemData?.nextPromotionDate)}
              />
            </>
          ) : (
            <Field label="Lương khoán" value={itemData?.lumpSum} />
          )}
          <Field label="Chức danh" value={itemData?.position.name} />
          <Field label="Quyết định số" value={itemData?.decision.number} />
          <Field
            label="Ngày ký"
            value={displayDate(itemData?.decision.signedDate)}
          />
          <Field
            label="File quyết định"
            value={
              itemData?.decision.file && (
                <FileBadge file={itemData.decision.file} />
              )
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
});
