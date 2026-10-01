import { useData } from "@/hooks/zustand/useData";
import {
  getEmployeeExamPeriodsSummaryApi,
  type EmployeeExamPeriodsSummary,
} from "@/services/exam.service";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Card,
  Divider,
  Icon,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ExamMenuKey = "participating" | "registration" | "all";

const menuItems: Array<{
  key: ExamMenuKey;
  icon: string;
  title: string;
}> = [
  {
    key: "participating",
    icon: "clipboard-text-search-outline",
    title: "Theo dõi kỳ thi",
  },
  {
    key: "registration",
    icon: "account-edit-outline",
    title: "Đăng ký tham gia",
  },
  {
    key: "all",
    icon: "history",
    title: "Quá trình thi",
  },
];

function ExamStatCard({
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

export default function ExamPage() {
  const user = useData((state) => state.user);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<EmployeeExamPeriodsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const employeeId = user?.employeeId;

  const reloadSummary = useCallback(async () => {
    if (!employeeId) {
      setSummary(null);
      return;
    }

    setLoading(true);
    try {
      setSummary(await getEmployeeExamPeriodsSummaryApi(employeeId));
    } catch {
      // The summary endpoint is pending backend implementation.
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useFocusEffect(
    useCallback(() => {
      void reloadSummary();
    }, [reloadSummary]),
  );

  const openMenu = (key: ExamMenuKey) => {
    router.push(`/screen/exam-period-list?type=${key}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              <Icon source="clipboard-text-outline" size={15} color="#DCE8FF" />
              <Text style={styles.headerEyebrowText}>EPS EXAM</Text>
            </View>
            <Text style={styles.headerTitle}>Kỳ thi</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon source="trophy-outline" size={32} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void reloadSummary()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Kỳ thi của tôi
        </Text>
        <View style={styles.statRow}>
          <ExamStatCard
            label="Đang tham gia"
            value={summary ? String(summary.participatingCount) : "—"}
            icon="clipboard-text-clock-outline"
            color={colors.primary}
          />
          <ExamStatCard
            label="Đã hoàn thành"
            value={summary ? String(summary.completedCount) : "—"}
            icon="check-circle-outline"
            color="#087A52"
          />
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Chức năng kỳ thi
        </Text>
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <View key={item.key}>
              <TouchableRipple
                accessibilityRole="button"
                onPress={() => openMenu(item.key)}
                rippleColor={`${colors.primary}20`}
              >
                <View style={styles.menuItem}>
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
                </View>
              </TouchableRipple>
              {index < menuItems.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

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
  menuList: { backgroundColor: "transparent" },
  menuItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuTitle: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "700" },
});
