import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

interface DetailSectionHeaderProps {
  title: string;
  icon?: string;
  inset?: boolean;
}

export default function DetailSectionHeader({
  title,
  icon,
  inset = true,
}: DetailSectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, !inset && styles.noInset]}>
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
  noInset: {
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
