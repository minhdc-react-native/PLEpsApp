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
  const tones = {
    primary: { foreground: colors.primary, background: colors.primaryContainer },
    success: { foreground: "#087A52", background: "#E3F5EE" },
    error: { foreground: colors.error, background: colors.errorContainer },
    neutral: {
      foreground: colors.onSurfaceVariant,
      background: colors.surfaceVariant,
    },
  };
  const appearance = tones[tone];

  return <Text style={[styles.status, { color: appearance.foreground, backgroundColor: appearance.background }]}>{label}</Text>;
}

export function ExamStageDateRange({
  start,
  end,
}: ExamStageDateRangeProps) {
  const { colors } = useTheme();
  const { displayDate } = helper();
  const now = new Date();
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const isActive =
    !!startDate && !!endDate && now >= startDate && now <= endDate;
  const isExpired = !!endDate && now > endDate;
  const valueColor = isActive ? "#087A52" : isExpired ? colors.error : colors.onSurfaceVariant;

  return (
    <View style={styles.dateRange}>
      <Icon source="calendar" size={15} color={colors.onSurfaceVariant} />
      <Text style={[styles.dateValue, { color: valueColor }]}>
        {start || end
          ? `${displayDate(start, "--")} – ${displayDate(end, "--")}`
          : "Chưa có lịch"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    overflow: "hidden",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dateValue: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
