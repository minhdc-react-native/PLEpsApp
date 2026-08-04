import { StyleSheet } from "react-native";
import { Avatar, Card, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ManageTraining = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card mode="outlined" style={[styles.card, { borderColor: colors.outlineVariant }]}>
        <Card.Content style={styles.content}>
          <Avatar.Icon
            icon="book-open-page-variant-outline"
            size={64}
            style={{ backgroundColor: colors.primaryContainer }}
            color={colors.primary}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Quản lý đào tạo
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: colors.onSurfaceVariant }]}
          >
            Khu vực đào tạo sẽ hiển thị các chương trình và tiến độ học tập của bạn.
          </Text>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: { borderRadius: 24, backgroundColor: "#FFFFFF" },
  content: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 20 },
  title: { marginTop: 20, fontWeight: "700", textAlign: "center" },
  description: { marginTop: 8, textAlign: "center", lineHeight: 22 },
});

export default ManageTraining;
