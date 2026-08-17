import { router } from "expo-router";
import { trainingHref } from "@/utils/training-navigation";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Card, Divider, Icon, List, Text, useTheme } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const ManageTraining = () => {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  const items = [
    {
      icon: "clipboard-text-search-outline",
      title: "Đăng ký khóa đào tạo",
      description: "Xem khóa đang mở và đăng ký tham gia",
      route: "/screen/training/course-registration",
      color: colors.primary,
    },
    {
      icon: "account-school-outline",
      title: "Lớp học của tôi",
      description: "Theo dõi buổi học, điểm danh và kết quả",
      route: "/screen/training/classes",
      color: colors.tertiary,
    },
    {
      icon: "star-check-outline",
      title: "Đánh giá sau đào tạo",
      description: "Gửi đánh giá khóa học và giảng viên",
      route: "/screen/training/evaluations",
      color: "#B06A00",
    },
    {
      icon: "history",
      title: "Quá trình đào tạo",
      description: "Xem các khóa đã hoàn tất",
      route: "/screen/history?tab=training",
      color: "#6D4AC7",
    },
  ] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={["#123EAA", "#2168E9", "#317CF5"]}
          start={{ x: 0, y: 0.1 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: top ? 10 : 22 }]}
        >
          <View style={styles.heroCopy}>
            <View style={styles.eyebrow}>
              <Icon source="book-open-page-variant" size={15} color="#FFFFFF" />
              <Text style={styles.eyebrowText}>EPS TRAINING</Text>
            </View>
            <Text style={styles.heroTitle}>Hành trình đào tạo</Text>
            <Text style={styles.heroDescription}>
              Tập trung mọi khóa học, buổi học và kết quả của bạn trong một nơi.
            </Text>
          </View>
          <Avatar.Icon icon="school-outline" size={86} style={styles.heroIcon} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.sectionHeading}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Khu vực đào tạo</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              Chọn nội dung bạn muốn tiếp tục
            </Text>
          </View>
          <View style={styles.grid}>
            {items.map((item) => (
              <Card
                key={item.title}
                mode="outlined"
                style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                onPress={() => router.push(trainingHref(item.route))}
              >
                <Card.Content style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: `${item.color}18` }]}>
                    <Icon source={item.icon} size={28} color={item.color} />
                  </View>
                  <View style={styles.actionCopy}>
                    <Text variant="titleSmall" style={styles.actionTitle}>{item.title}</Text>
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, lineHeight: 18 }}>
                      {item.description}
                    </Text>
                  </View>
                  <Icon source="chevron-right" size={22} color={colors.onSurfaceVariant} />
                </Card.Content>
              </Card>
            ))}
          </View>

          <Card mode="outlined" style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <List.Item
              title="Lưu ý"
              description="Khóa trực tuyến không yêu cầu điểm danh lớp. Với khóa tập trung, bạn có thể điểm danh trực tiếp trong thời gian buổi học đang diễn ra."
              left={(props) => <List.Icon {...props} icon="information-outline" color={colors.primary} />}
              titleStyle={styles.noteTitle}
              descriptionStyle={styles.noteDescription}
            />
            <Divider />
            <List.Item
              title="Bài thi đào tạo"
              description="Model và contract đã được chuẩn bị; luồng làm bài/xem lại sẽ được hoàn thiện ở đợt tiếp theo."
              left={(props) => <List.Icon {...props} icon="file-document-edit-outline" color={colors.onSurfaceVariant} />}
              titleStyle={styles.noteTitle}
              descriptionStyle={styles.noteDescription}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  hero: {
    minHeight: 228,
    paddingHorizontal: 20,
    paddingBottom: 28,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroCopy: { width: "75%", zIndex: 1 },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  eyebrowText: { color: "#DCE8FF", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  heroTitle: { color: "#FFFFFF", fontSize: 29, lineHeight: 36, fontWeight: "800" },
  heroDescription: { color: "#DCE8FF", fontSize: 14, lineHeight: 21, marginTop: 10 },
  heroIcon: { position: "absolute", right: 20, top: 34, backgroundColor: "rgba(255,255,255,0.16)" },
  content: { paddingHorizontal: 16, paddingTop: 22, gap: 16 },
  sectionHeading: { gap: 3 },
  sectionTitle: { fontWeight: "800" },
  grid: { gap: 12 },
  actionCard: { borderRadius: 20 },
  actionContent: { minHeight: 88, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionCopy: { flex: 1, gap: 4 },
  actionTitle: { fontWeight: "700" },
  noteCard: { borderRadius: 20, overflow: "hidden" },
  noteTitle: { fontWeight: "700" },
  noteDescription: { lineHeight: 18 },
});

export default ManageTraining;
