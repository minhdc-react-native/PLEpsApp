import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import DetailSectionHeader from "@/components/detail-section-header";
import LoadingScreen from "@/components/loading-screen";
import { useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { getTrainingHistoryApi } from "@/services/training.service";
import { trainingHref } from "@/utils/training-navigation";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, IconButton, Text, useTheme } from "react-native-paper";

export default function TrainingHistoryScreen({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const [year, setYear] = useState(new Date().getFullYear());
  const load = useCallback(
    () =>
      employeeId
        ? getTrainingHistoryApi(employeeId, year)
        : Promise.resolve([]),
    [employeeId, year],
  );
  const { data, loading, reload } = useTrainingResource(load, [employeeId, year]);

  const content = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => void reload()}
        />
      }
    >
      {loading && !data ? <LoadingScreen /> : (
        <>
          <DetailSectionHeader
            title="Danh sách khóa đào tạo"
            count={data?.length ?? 0}
            inset={false}
          />
          {data?.length ? data.map((item) => (
            <Card
              key={item.id}
              mode="outlined"
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outlineVariant,
                },
              ]}
              onPress={() =>
                router.push(
                  trainingHref(
                    `/screen/training/class-detail?trainingCourseId=${encodeURIComponent(item.id)}`,
                  ),
                )
              }
            >
              <Card.Content style={styles.cardContent}>
                <View
                  style={[styles.icon, { backgroundColor: colors.tertiaryContainer }]}
                >
                  <Text style={{ fontSize: 23 }}>🏅</Text>
                </View>
                <View style={styles.cardCopy}>
                  <Text variant="titleMedium" style={styles.title}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.onSurfaceVariant }}>
                    {item.registeredClass?.name ?? "Khóa đào tạo"}
                  </Text>
                  <View style={styles.meta}>
                    <Badge variant="success">Đã kết thúc</Badge>
                    {item.score != null ? (
                      <Text style={{ color: colors.onSurfaceVariant }}>
                        Điểm: {item.score}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Card.Content>
            </Card>
          )) : (
            <View style={styles.emptyState}>
              <Text style={{ color: colors.onSurfaceVariant }}>
                Chưa có quá trình đào tạo
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  if (embedded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {content}
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader
        title="Quá trình đào tạo"
        subtitle="Các khóa đã hoàn tất"
        onBack={() => router.back()}
        actions={
          <View style={styles.yearActions}>
            <IconButton
              icon="chevron-left"
              size={20}
              onPress={() => setYear((value) => value - 1)}
            />
            <Text style={styles.year}>{year}</Text>
            <IconButton
              icon="chevron-right"
              size={20}
              onPress={() => setYear((value) => value + 1)}
            />
          </View>
        }
      />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  card: { borderRadius: 20, marginBottom: 12 },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: { flex: 1, gap: 5 },
  title: { fontWeight: "800" },
  meta: { flexDirection: "row", alignItems: "center", gap: 10 },
  emptyState: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
  },
});
