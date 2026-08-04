import { helper } from "@/hooks/useHelper";
import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

type StageStatusTone = "primary" | "success" | "error" | "neutral";

interface ExamStageStatusProps {
  label: string;
  tone?: StageStatusTone;
}

interface ExamStageDateRangeProps {
  start?: Date | null;
  end?: Date | null;
}

export function ExamStageStatus({
  label,
  tone = "neutral",
}: ExamStageStatusProps) {
  const { colors } = useTheme();
  const toneColors = {
    primary: colors.primary,
    success: "#087A52",
    error: colors.error,
    neutral: colors.onSurfaceVariant,
  };

  return (
    <Text style={[styles.status, { color: toneColors[tone] }]}>{label}</Text>
  );
}

export function ExamStageDateRange({
  start,
  end,
}: ExamStageDateRangeProps) {
  const { colors } = useTheme();
  const { displayDatetimeShort } = helper();
  const now = new Date();
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const isActive =
    !!startDate && !!endDate && now >= startDate && now <= endDate;
  const isExpired = !!endDate && now > endDate;
  const valueColor = isActive
    ? "#087A52"
    : isExpired
      ? colors.error
      : colors.onSurfaceVariant;

  return (
    <View style={styles.dateRange}>
      <View style={styles.dateRow}>
        <Icon source="calendar" size={16} color={colors.onSurfaceVariant} />
        <Text style={[styles.dateLabel, { color: colors.onSurface }]}>Từ:</Text>
        <Text style={[styles.dateValue, { color: valueColor }]}>
          {displayDatetimeShort(start, "--")}
        </Text>
      </View>
      <View style={styles.dateRow}>
        <Icon source="calendar" size={16} color={colors.onSurfaceVariant} />
        <Text style={[styles.dateLabel, { color: colors.onSurface }]}>Đến:</Text>
        <Text style={[styles.dateValue, { color: valueColor }]}>
          {displayDatetimeShort(end, "--")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  dateRange: {
    gap: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateLabel: {
    fontWeight: "700",
  },
  dateValue: {
    flex: 1,
    textAlign: "right",
  },
});
