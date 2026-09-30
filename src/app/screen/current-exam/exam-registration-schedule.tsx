import { helper } from "@/hooks/useHelper";
import { StyleSheet, View } from "react-native";
import { Card, Icon, Text, useTheme } from "react-native-paper";

interface ExamRegistrationScheduleProps {
  start?: Date | null;
  end?: Date | null;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function calendarDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function ExamRegistrationSchedule({
  start,
  end,
}: ExamRegistrationScheduleProps) {
  const { colors } = useTheme();
  const { displayDate } = helper();
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const today = new Date();
  const daysUntilStart = startDate
    ? Math.ceil((calendarDay(startDate) - calendarDay(today)) / DAY_IN_MS)
    : null;
  const daysUntilEnd = endDate
    ? Math.ceil((calendarDay(endDate) - calendarDay(today)) / DAY_IN_MS)
    : null;

  const scheduleStatus =
    !startDate || !endDate
      ? "Chưa cập nhật lịch đăng ký"
      : daysUntilStart! > 0
        ? `Mở đăng ký sau ${daysUntilStart} ngày`
        : daysUntilEnd! < 0
          ? "Đã kết thúc"
          : `Còn ${daysUntilEnd} ngày`;

  return (
    <Card
      mode="contained"
      style={[styles.card, { backgroundColor: colors.primaryContainer }]}
    >
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
          <Icon source="calendar-month-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.status, { color: colors.primary }]}>
            {scheduleStatus}
          </Text>
          <Text style={[styles.range, { color: colors.onSurfaceVariant }]}>
            Từ {displayDate(startDate, "--")} đến {displayDate(endDate, "--")}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 0,
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  status: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  range: {
    fontSize: 12,
    lineHeight: 17,
  },
});
