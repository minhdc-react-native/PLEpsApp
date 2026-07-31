import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

interface DetailSectionHeaderProps {
  title: string;
  icon?: string;
}

export default function DetailSectionHeader({
  title,
  icon,
}: DetailSectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon && <Icon source={icon} size={18} color={colors.primary} />}
      <Text
        variant="labelSmall"
        style={[styles.title, { color: colors.onSurfaceVariant }]}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 8,
  },
  title: {
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
