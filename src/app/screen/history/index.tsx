import AppHeader from "@/components/app-header";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, Icon, Text, TouchableRipple, useTheme } from "react-native-paper";

const historyMenus = [
  { key: "salary", title: "Quá trình hưởng lương", icon: "cash-multiple" },
  { key: "work-history", title: "Quá trình công tác", icon: "briefcase-outline" },
  { key: "project-history", title: "Quá trình tham gia công trình", icon: "office-building-outline" },
  { key: "exam", title: "Quá trình thi", icon: "clipboard-text-outline" },
  { key: "training", title: "Quá trình đào tạo", icon: "school-outline" },
  { key: "certificate", title: "Chứng chỉ", icon: "certificate-outline" },
  { key: "skill-standard", title: "Tiêu chuẩn bậc thợ", icon: "clipboard-check-outline" },
] as const;

export default function History() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Quá trình" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.menuList}>
          {historyMenus.map((item, index) => (
            <View key={item.key}>
              <TouchableRipple
                accessibilityRole="button"
                onPress={() => router.push(`/screen/history/list?type=${item.key}`)}
                rippleColor={`${colors.primary}20`}
                style={styles.menuItem}
              >
                <View style={styles.menuItemContent}>
                  <Icon source={item.icon} size={23} color={colors.primary} />
                  <Text style={[styles.menuTitle, { color: colors.onSurface }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Icon source="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </View>
              </TouchableRipple>
              {index < historyMenus.length - 1 ? (
                <View style={styles.dividerInset}>
                  <Divider />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  menuList: { backgroundColor: "transparent" },
  menuItem: {
    width: "100%",
  },
  menuItemContent: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerInset: { paddingHorizontal: 16 },
  menuTitle: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "700" },
});
