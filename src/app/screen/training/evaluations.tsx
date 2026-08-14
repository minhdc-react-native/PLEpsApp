import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { TrainingEmptyState } from "@/components/training/training-presentational";
import { formatTrainingDate, useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { getTrainingEvaluationsApi } from "@/services/training.service";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, IconButton, Searchbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { trainingHref } from "@/utils/training-navigation";

export default function TrainingEvaluationsScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const userId = user?.id;
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const load = useCallback(() => userId ? getTrainingEvaluationsApi(userId, year) : Promise.resolve([]), [userId, year]);
  const { data, loading, reload } = useTrainingResource(load, [userId, year]);
  const evaluations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data ?? []).filter((item) => `${item.courseName} ${item.className ?? ""}`.toLowerCase().includes(query));
  }, [data, search]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <AppHeader
        title="Đánh giá sau đào tạo"
        subtitle="Chia sẻ trải nghiệm học tập của bạn"
        onBack={() => router.back()}
        actions={<View style={styles.yearActions}><IconButton icon="chevron-left" size={20} onPress={() => setYear((value) => value - 1)} /><Text style={styles.year}>{year}</Text><IconButton icon="chevron-right" size={20} onPress={() => setYear((value) => value + 1)} /></View>}
      />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
        <Card mode="outlined" style={[styles.intro, { backgroundColor: colors.tertiaryContainer, borderColor: colors.tertiaryContainer }]}>
          <Card.Content style={styles.introContent}><Text style={{ fontSize: 26 }}>⭐</Text><View style={{ flex: 1, gap: 3 }}><Text style={[styles.title, { color: colors.onTertiaryContainer }]}>Đánh giá để cải thiện</Text><Text style={{ color: colors.onTertiaryContainer, lineHeight: 19 }}>Mỗi phản hồi giúp nâng cao chất lượng khóa học và giảng viên.</Text></View></Card.Content>
        </Card>
        <Searchbar placeholder="Tìm khóa học..." value={search} onChangeText={setSearch} style={styles.search} />
        {loading && !data ? <LoadingScreen /> : evaluations.length ? evaluations.map((evaluation) => {
          const isOpen = evaluation.status === "open" && !evaluation.hasEvaluated && !evaluation.isPostponed;
          const statusLabel = evaluation.isPostponed ? "Đã xin hoãn" : evaluation.hasEvaluated ? "Đã hoàn tất" : evaluation.status === "open" ? "Đang mở" : evaluation.status === "completed" ? "Đã đóng" : "Chưa mở";
          const statusVariant = evaluation.isPostponed ? "warning" : evaluation.hasEvaluated || evaluation.status === "completed" ? "success" : evaluation.status === "open" ? "primary" : "default";
          return (
            <Card key={evaluation.trainingCourseId} mode="outlined" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => router.push(trainingHref(`/screen/training/evaluation-form?trainingCourseId=${encodeURIComponent(evaluation.trainingCourseId)}`))}>
              <Card.Content style={styles.cardContent}>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}><Text style={{ fontSize: 23 }}>📝</Text></View>
                <View style={{ flex: 1, gap: 5 }}><Text variant="titleMedium" style={styles.title}>{evaluation.courseName}</Text><Text style={{ color: colors.onSurfaceVariant }}>{evaluation.className ?? "Khóa đào tạo"}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{formatTrainingDate(evaluation.startDate)} - {formatTrainingDate(evaluation.endDate)}</Text></View>
                <Badge variant={statusVariant}>{isOpen ? "Đánh giá" : statusLabel}</Badge>
              </Card.Content>
            </Card>
          );
        }) : <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><TrainingEmptyState icon="star-check-outline" title="Chưa có khảo sát" description="Khảo sát sẽ xuất hiện khi khóa học được mở đánh giá." /></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  intro: { borderRadius: 20, marginBottom: 14 },
  introContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13 },
  title: { fontWeight: "800" },
  search: { borderRadius: 16, marginBottom: 14 },
  card: { borderRadius: 20, marginBottom: 12 },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  iconBox: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  empty: { borderWidth: 1, borderRadius: 20 },
});
