import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

export interface HistoryOverviewStat {
  label: string;
  value: string | number;
  icon?: string;
  tone?: "primary" | "success" | "error" | "neutral";
}

interface HistoryOverviewCardProps {
  title: string;
  subtitle: string;
  icon: string;
  stats?: HistoryOverviewStat[];
}

export function HistoryOverviewCard({
  title,
  subtitle,
  icon,
  stats,
}: HistoryOverviewCardProps) {
  const { colors } = useTheme();
  const toneColors = {
    primary: { backgroundColor: colors.primaryContainer, color: colors.primary },
    success: { backgroundColor: "#E3F5EC", color: "#087A52" },
    error: { backgroundColor: "#FCE5E5", color: colors.error },
    neutral: { backgroundColor: colors.surfaceVariant, color: colors.onSurfaceVariant },
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
          <Icon source={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        </View>
      </View>

      {stats && stats.length > 0 && (
        <>
          <View style={[styles.separator, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.statsRow}>
            {stats.map((stat, index) => {
          const tone = toneColors[stat.tone ?? "primary"];
          return (
            <View
              key={`${stat.label}-${index}`}
              style={[
                styles.statCell,
                index > 0 && {
                  borderLeftWidth: 1,
                  borderLeftColor: colors.outlineVariant,
                  paddingLeft: 10,
                },
              ]}
            >
              {stat.icon ? (
                <View style={[styles.statIcon, { backgroundColor: tone.backgroundColor }]}>
                  <Icon source={stat.icon} size={18} color={tone.color} />
                </View>
              ) : (
                <View style={[styles.numberBadge, { backgroundColor: tone.backgroundColor }]}>
                  <Text style={[styles.numberBadgeText, { color: tone.color }]}>
                    {stat.value}
                  </Text>
                </View>
              )}
              <View style={styles.statCopy}>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  {stat.label}
                </Text>
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  {stat.value}
                </Text>
              </View>
            </View>
          );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1D5FE9",
  },
  heading: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    marginTop: 12,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadgeText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  statValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },
});
