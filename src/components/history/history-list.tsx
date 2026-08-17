import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

interface HistoryListCardProps {
  children: ReactNode;
}

interface HistoryListItemProps {
  title: string;
  subtitle: string;
  icon: string;
  iconBackgroundColor: string;
  iconColor: string;
  result?: {
    label: string;
    color: string;
  };
  onPress?: () => void;
  last?: boolean;
}

export function HistoryListCard({ children }: HistoryListCardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.listCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function HistoryListItem({
  title,
  subtitle,
  icon,
  iconBackgroundColor,
  iconColor,
  result,
  onPress,
  last = false,
}: HistoryListItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.item, !last && styles.itemDivider, pressed && styles.pressed]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        <Icon source={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.onSurface }]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
        {result && (
          <Text style={[styles.result, { color: colors.onSurfaceVariant }]}>
            Kết quả:{" "}
            <Text style={[styles.resultValue, { color: result.color }]}>{result.label}</Text>
          </Text>
        )}
      </View>
      {onPress && (
        <View style={styles.trailing}>
          <Icon source="chevron-right" size={20} color={colors.onSurfaceVariant} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  item: {
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  pressed: {
    opacity: 0.72,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  trailing: {
    alignItems: "flex-end",
    gap: 6,
  },
  result: {
    fontSize: 12,
    lineHeight: 17,
  },
  resultValue: {
    fontWeight: "700",
  },
});
