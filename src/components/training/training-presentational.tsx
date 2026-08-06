import { Badge } from "@/components/badge";
import { getTrainingStatusLabel, getTrainingStatusVariant, formatTrainingDateTime } from "@/hooks/useTraining";
import { TrainingCourse, TrainingSession } from "@/types/training.model";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Card, Icon, Text, useTheme } from "react-native-paper";

export function TrainingStatusBadge({ status }: { status: number }) {
  return <Badge variant={getTrainingStatusVariant(status)}>{getTrainingStatusLabel(status)}</Badge>;
}

export function TrainingEmptyState({ icon = "inbox-outline", title, description }: { icon?: string; title: string; description?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={32} color={colors.primary} />
      </View>
      <Text variant="titleMedium" style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={[styles.emptyDescription, { color: colors.onSurfaceVariant }]}>{description}</Text> : null}
    </View>
  );
}

export function TrainingCourseCard({ course, action, onPress }: { course: TrainingCourse; action?: React.ReactNode; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={[styles.courseIcon, { backgroundColor: colors.primaryContainer }]}>
          <Icon source={course.type === 0 ? "laptop-account" : "account-school-outline"} size={26} color={colors.primary} />
        </View>
        <View style={styles.cardCopy}>
          <Text variant="titleMedium" style={styles.courseName}>{course.name}</Text>
          <View style={styles.metaRow}>
            <TrainingStatusBadge status={course.status} />
            {course.year ? <Text style={[styles.meta, { color: colors.onSurfaceVariant }]}>{course.year}</Text> : null}
          </View>
          {course.description ? <Text numberOfLines={2} style={[styles.description, { color: colors.onSurfaceVariant }]}>{course.description}</Text> : null}
        </View>
        {action}
      </Card.Content>
    </Card>
  );
}

export function SessionCard({ session, attendanceLabel, onPress }: { session: TrainingSession; attendanceLabel?: string; onPress: () => void }) {
  const { colors } = useTheme();
  const statusLabel = session.status === 1 ? "Đang diễn ra" : session.status === 2 ? "Đã kết thúc" : "Chưa bắt đầu";
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={onPress}>
      <Card.Content style={styles.sessionContent}>
        <View style={[styles.sessionNumber, { backgroundColor: colors.primaryContainer }]}>
          <Icon source={session.status === 1 ? "play-circle-outline" : "calendar-blank-outline"} size={24} color={colors.primary} />
        </View>
        <View style={styles.cardCopy}>
          <Text variant="titleSmall" style={styles.courseName}>{session.name}</Text>
          <Text style={[styles.meta, { color: colors.onSurfaceVariant }]}>{formatTrainingDateTime(session.startDate)}{session.endDate ? ` - ${formatTrainingDateTime(session.endDate)}` : ""}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: session.status === 1 ? colors.primary : colors.onSurfaceVariant }]}>{statusLabel}</Text>
            {attendanceLabel ? <Text style={[styles.meta, { color: colors.onSurfaceVariant }]}>{attendanceLabel}</Text> : null}
          </View>
        </View>
        <Icon source="chevron-right" size={22} color={colors.onSurfaceVariant} />
      </Card.Content>
    </Card>
  );
}

export function SectionCard({ title, icon, children, style }: { title: string; icon?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <Card mode="outlined" style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }, style]}>
      <Card.Title title={title} left={(props) => icon ? <Icon {...props} source={icon} color={colors.primary} /> : null} titleStyle={styles.sectionTitle} />
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingVertical: 56, gap: 10 },
  emptyIcon: { width: 70, height: 70, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontWeight: "800", textAlign: "center" },
  emptyDescription: { textAlign: "center", lineHeight: 20 },
  card: { borderRadius: 20, marginBottom: 12 },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  courseIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1, gap: 5, minWidth: 0 },
  courseName: { fontWeight: "750" as any },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  meta: { fontSize: 12, lineHeight: 17 },
  description: { fontSize: 13, lineHeight: 19 },
  sessionContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13 },
  sessionNumber: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  sectionCard: { borderRadius: 20, marginBottom: 14 },
  sectionTitle: { fontWeight: "800" },
});
