import AppHeader from "@/components/app-header";
import { TrainingCourseCard, TrainingEmptyState } from "@/components/training/training-presentational";
import { useTrainingResource } from "@/hooks/useTraining";
import { getMyTrainingCoursesApi } from "@/services/training.service";
import { MyTrainingCourse } from "@/types/training.model";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, Icon, IconButton, Searchbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { trainingHref } from "@/utils/training-navigation";

export default function TrainingClassesScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const load = useCallback(
    () => (employeeId ? getMyTrainingCoursesApi(employeeId, year, { status: 30, isDeployedCourse: true }) : Promise.resolve([])),
    [employeeId, year],
  );
  const { data, loading, reload } = useTrainingResource(load, [employeeId, year]);
  const courses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data ?? []).filter((item) => `${item.name} ${item.registeredClass?.name ?? ""}`.toLowerCase().includes(query));
  }, [data, search]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <AppHeader
        title="Lớp học của tôi"
        subtitle="Theo dõi tiến độ học tập cá nhân"
        onBack={() => router.back()}
        actions={
          <View style={styles.yearActions}>
            <IconButton icon="chevron-left" size={20} onPress={() => setYear((value) => value - 1)} />
            <Text style={styles.year}>{year}</Text>
            <IconButton icon="chevron-right" size={20} onPress={() => setYear((value) => value + 1)} />
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
        <View style={styles.summaryRow}>
          <Card mode="outlined" style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <Card.Content>
              <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Tổng khóa</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{data?.length ?? 0}</Text>
            </Card.Content>
          </Card>
          <Card mode="outlined" style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <Card.Content>
              <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Có lớp</Text>
              <Text style={[styles.summaryValue, { color: colors.tertiary }]}>{data?.filter((item) => !!item.registeredClass).length ?? 0}</Text>
            </Card.Content>
          </Card>
        </View>
        <Searchbar placeholder="Tìm khóa hoặc lớp..." value={search} onChangeText={setSearch} style={styles.search} />
        {loading && !data ? <LoadingScreen /> : courses.length ? courses.map((course) => (
          <TrainingClassCard key={course.id} course={course} onPress={() => router.push(trainingHref(`/screen/training/class-detail?trainingCourseId=${encodeURIComponent(course.id)}`))} />
        )) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <TrainingEmptyState icon="account-school-outline" title="Chưa có lớp học" description="Các khóa bạn đã đăng ký sẽ xuất hiện tại đây." />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TrainingClassCard({ course, onPress }: { course: MyTrainingCourse; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TrainingCourseCard
      course={course}
      onPress={onPress}
      action={<Icon source="chevron-right" size={22} color={colors.onSurfaceVariant} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 18 },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 26, lineHeight: 32, fontWeight: "800", marginTop: 4 },
  search: { borderRadius: 16, marginBottom: 14 },
  emptyCard: { borderWidth: 1, borderRadius: 20 },
});
