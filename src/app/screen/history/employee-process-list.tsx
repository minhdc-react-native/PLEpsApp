/* eslint-disable react-hooks/set-state-in-effect */
import DetailSectionHeader from "@/components/detail-section-header";
import {
  HistoryListCard,
  HistoryListItem,
} from "@/components/history/history-list";
import { HistoryOverviewCard } from "@/components/history/history-overview-card";
import { useData } from "@/hooks/zustand/useData";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export interface EmployeeProcessListItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  data: Record<string, any>;
  result?: {
    label: string;
    color: string;
  };
}

interface EmployeeProcessListProps {
  title: string;
  listTitle: string;
  overviewIcon: string;
  emptyText: string;
  loadItems: (employeeId: string) => Promise<EmployeeProcessListItem[]>;
  onItemPress: (item: EmployeeProcessListItem) => void;
}

export function formatProcessDate(value: unknown) {
  if (!value) return "Chưa cập nhật";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : date.toLocaleDateString("vi-VN");
}

export function formatProcessPeriod(startDate: unknown, endDate: unknown) {
  return `${formatProcessDate(startDate)} - ${endDate ? formatProcessDate(endDate) : "Hiện tại"}`;
}

export default function EmployeeProcessList({
  title,
  listTitle,
  overviewIcon,
  emptyText,
  loadItems,
  onItemPress,
}: EmployeeProcessListProps) {
  const user = useData((state) => state.user);
  const { colors } = useTheme();
  const [items, setItems] = useState<EmployeeProcessListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const employeeId = user?.employeeId;

  const onRefresh = useCallback(async () => {
    if (!employeeId) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      setItems(await loadItems(employeeId));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, loadItems]);

  useEffect(() => {
    void onRefresh();
  }, [onRefresh]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => void onRefresh()}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <HistoryOverviewCard
        title={title}
        subtitle={`Đã có ${items.length} mục`}
        icon={overviewIcon}
      />

      <DetailSectionHeader title={listTitle} inset={false} />
      {items.length > 0 ? (
        <HistoryListCard>
          {items.map((item, index) => (
            <HistoryListItem
              key={item.id || index}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              iconColor={colors.primary}
              iconBackgroundColor={colors.primaryContainer}
              result={item.result}
              onPress={() => onItemPress(item)}
              last={index === items.length - 1}
            />
          ))}
        </HistoryListCard>
      ) : (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.onSurfaceVariant }}>{emptyText}</Text>
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
