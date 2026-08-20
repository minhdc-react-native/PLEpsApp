import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

interface DetailSectionHeaderProps {
  title: string;
  icon?: string;
  inset?: boolean;
  count?: number;
}

export default function DetailSectionHeader({
  title,
  icon,
  inset = true,
  count,
}: DetailSectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, !inset && styles.noInset]}>
      {icon && <Icon source={icon} size={18} color={colors.primary} />}
      <Text
        variant="labelSmall"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.title, { color: colors.onSurfaceVariant }]}
      >
        {title}
      </Text>
      {count !== undefined ? (
        <Text variant="labelSmall" style={[styles.count, { color: colors.onSurfaceVariant }]}>
          {count}
        </Text>
      ) : null}
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
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  count: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
});
