import {
  HistoryOverviewCard,
} from "@/components/history/history-overview-card";
import DetailSectionHeader from "@/components/detail-section-header";
import {
  HistoryListCard,
  HistoryListItem,
} from "@/components/history/history-list";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { mapEmployeeSalaryHistory } from "@/mappers/employee/salary-history.mapper";
import { ISalaryHistory } from "@/types/employee/salary-history.model";
import { api } from "@/utils/epsApi";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function SalaryHistoryManagement() {
  const [data, setData] = useState<ISalaryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useData((state) => state.user);
  const setItemData = useData((state) => state.setItemData);
  const { displayDate } = helper();
  const { colors } = useTheme();

  const onRefresh = () => {
    api.get({
      link: `/employees/salary-decision/${user?.id}`,
      callBack: (res) => {
        setData(res.returnData.map((item: any) => mapEmployeeSalaryHistory(item)));
      },
      setLoading,
    });
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <HistoryOverviewCard
        title="Lịch sử hưởng lương"
        subtitle={`Đã có ${data.length} quyết định`}
        icon="cash-multiple"
      />

      <DetailSectionHeader title="Danh sách quyết định" inset={false} />
      {data.length > 0 ? (
        <HistoryListCard>
          {data.map((item, index) => (
            <HistoryListItem
              key={item.id || index}
              title={`Ngạch ${item.payroll?.code ?? "-"} - Bậc ${item.rank?.rank ?? "-"}/${item.rank?.rankScale ?? "-"}`}
              subtitle={`Ngày hưởng: ${displayDate(item.startDate)}`}
              icon={item.apply ? "star" : "cash-multiple"}
              iconColor={item.apply ? "#C58A00" : colors.onSurfaceVariant}
              iconBackgroundColor={item.apply ? "#FFF4CC" : colors.surfaceVariant}
              last={index === data.length - 1}
              onPress={() => {
                setItemData(item);
                router.navigate("/screen/history/salary/salary-history-detail");
              }}
            />
          ))}
        </HistoryListCard>
      ) : (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.onSurfaceVariant }}>Chưa có lịch sử hưởng lương</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  emptyState: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
  },
});
