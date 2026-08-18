import LoadingScreen from "@/components/loading-screen";
import { useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { getMyTrainingCoursesApi } from "@/services/training.service";
import {
  MyTrainingCourse,
  TRAINING_COURSE_STATUS,
} from "@/types/training.model";
import { trainingHref } from "@/utils/training-navigation";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Card, Divider, Icon, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const menuItems = [
  {
    icon: "clipboard-text-search-outline",
    title: "Đăng ký khóa đào tạo",
    route: "/screen/training/course-registration",
  },
  {
    icon: "account-school-outline",
    title: "Lớp học của tôi",
    route: "/screen/training/classes",
  },
  {
    icon: "star-check-outline",
    title: "Đánh giá sau đào tạo",
    route: "/screen/training/evaluations",
  },
  {
    icon: "history",
    title: "Quá trình đào tạo",
    route: "/screen/history?tab=training",
  },
] as const;

function TrainingStatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  const { colors } = useTheme();

  return (
    <Card
      mode="outlined"
      style={[
        styles.statCard,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <Card.Content style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
          <Icon source={icon} size={23} color={color} />
        </View>
        <Text style={[styles.statValue, { color: colors.onSurface }]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
}

function countMyCourses(courses: MyTrainingCourse[] | null) {
  const items = courses ?? [];
  return {
    active: items.filter(
      (course) =>
        course.status >= TRAINING_COURSE_STATUS.REGISTRATION &&
        course.status < TRAINING_COURSE_STATUS.FINISHED,
    ).length,
    completed: items.filter(
      (course) => course.status === TRAINING_COURSE_STATUS.FINISHED,
    ).length,
  };
}

const ManageTraining = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const year = new Date().getFullYear();
  const load = useCallback(
    () =>
      employeeId
        ? getMyTrainingCoursesApi(employeeId, year, { isDeployedCourse: true })
        : Promise.resolve([]),
    [employeeId, year],
  );
  const { data, loading, reload } = useTrainingResource(load, [employeeId, year]);
  const counts = countMyCourses(data);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["#123B9B", colors.primary, "#347AF1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerCopy}>
            <View style={styles.headerEyebrow}>
              <Icon source="book-open-page-variant" size={15} color="#DCE8FF" />
              <Text style={styles.headerEyebrowText}>EPS TRAINING</Text>
            </View>
            <Text style={styles.headerTitle}>Đào tạo</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon source="school-outline" size={32} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void reload()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Khóa học của tôi
        </Text>
        <View style={styles.statRow}>
          <TrainingStatCard
            label="Đang tham gia"
            value={loading && !data ? "—" : String(counts.active)}
            icon="book-open-page-variant-outline"
            color={colors.primary}
          />
          <TrainingStatCard
            label="Đã hoàn thành"
            value={loading && !data ? "—" : String(counts.completed)}
            icon="check-circle-outline"
            color="#087A52"
          />
        </View>

        {loading && !data ? <LoadingScreen style={styles.loading} /> : null}

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Chức năng đào tạo
        </Text>
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <View key={item.title}>
              <Pressable
                onPress={() => router.push(trainingHref(item.route))}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuPressed,
                ]}
              >
                <Icon source={item.icon} size={23} color={colors.primary} />
                <Text
                  style={[styles.menuTitle, { color: colors.onSurface }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Icon
                  source="chevron-right"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
              {index < menuItems.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerContent: {
    minHeight: 126,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: { gap: 3 },
  headerEyebrow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerEyebrowText: {
    color: "#DCE8FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 27, lineHeight: 33, fontWeight: "800" },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  sectionTitle: { fontWeight: "800", marginTop: 2 },
  statRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, borderRadius: 16 },
  statContent: { gap: 7, paddingVertical: 14 },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 26, lineHeight: 31, fontWeight: "800" },
  statLabel: { fontSize: 13, lineHeight: 18 },
  loading: { marginTop: 0, marginHorizontal: 0, height: 56 },
  menuList: { backgroundColor: "transparent" },
  menuItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuPressed: { opacity: 0.65 },
  menuTitle: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "700" },
});

export default ManageTraining;
