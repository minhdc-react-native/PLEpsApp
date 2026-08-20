import AppHeader from "@/components/app-header";
import { TrainingEmptyState } from "@/components/training/training-presentational";
import { formatTrainingDateTime, useTrainingResource } from "@/hooks/useTraining";
import { getMyTrainingCoursesApi } from "@/services/training.service";
import { MyTrainingCourse } from "@/types/training.model";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, Icon, IconButton, Text, useTheme } from "react-native-paper";
import LoadingScreen from "@/components/loading-screen";
import { trainingHref } from "@/utils/training-navigation";

export default function TrainingClassesScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const [year, setYear] = useState(new Date().getFullYear());
  const load = useCallback(
    () => (employeeId ? getMyTrainingCoursesApi(employeeId, year, { status: 30, isDeployedCourse: true }) : Promise.resolve([])),
    [employeeId, year],
  );
  const { data, loading, reload } = useTrainingResource(load, [employeeId, year]);
  const courses = data ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Lớp học của tôi"
        subtitle="Theo dõi tiến độ học tập cá nhân"
        onBack={() => router.back()}
        actions={
          <View style={styles.yearActions}>
            <IconButton icon="chevron-left" size={20} onPress={() => setYear((value) => value - 1)} />
            <Text style={styles.year}>{year}</Text>
            <IconButton icon="chevron-right" size={20} onPress={() => setYear((value) => value + 1)} />
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
        <Text style={[styles.classCount, { color: colors.onSurfaceVariant }]}>Số lượng lớp: {data?.filter((item) => !!item.registeredClass).length ?? 0}</Text>
        {loading && !data ? <LoadingScreen /> : courses.length ? courses.map((course) => (
          <TrainingClassCard key={course.id} course={course} onPress={() => router.push(trainingHref(`/screen/training/class-detail?trainingCourseId=${encodeURIComponent(course.id)}`))} />
        )) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <TrainingEmptyState icon="account-school-outline" title="Chưa có lớp học" description="Các khóa bạn đã đăng ký sẽ xuất hiện tại đây." />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TrainingClassCard({ course, onPress }: { course: MyTrainingCourse; onPress: () => void }) {
  const { colors } = useTheme();
  const schedule = getClassSchedule(course);

  return (
    <Card
      mode="outlined"
      style={[styles.classCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
      onPress={onPress}
    >
      <Card.Content style={styles.classCardContent}>
        <Image
          source={course.type === 0
            ? require("@/assets/images/training/video-lesson.png")
            : require("@/assets/images/training/teacher.png")}
          style={styles.classIcon}
          resizeMode="contain"
        />
        <View style={styles.classCardCopy}>
          <Text variant="titleMedium" style={styles.className} numberOfLines={1}>{course.name}</Text>
          {course.registeredClass?.name ? <Text style={[styles.classLabel, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{course.registeredClass.name}</Text> : null}
          <View style={styles.scheduleRow}>
            <Icon source={schedule.isOngoing ? "clock-play-outline" : "calendar-clock-outline"} size={16} color={schedule.isOngoing ? colors.primary : colors.onSurfaceVariant} />
            <View style={styles.scheduleCopy}>
              <Text style={[styles.scheduleLabel, { color: schedule.isOngoing ? colors.primary : colors.onSurfaceVariant }]}>{schedule.label}</Text>
              {schedule.dateLabel ? <Text style={[styles.scheduleDate, { color: schedule.isOngoing ? colors.primary : colors.onSurfaceVariant }]}>{schedule.dateLabel}</Text> : null}
            </View>
          </View>
        </View>
        <Icon source="chevron-right" size={22} color={colors.onSurfaceVariant} />
      </Card.Content>
    </Card>
  );
}

function getClassSchedule(course: MyTrainingCourse) {
  const sessions = (course.registeredClass?.sessions ?? [])
    .filter((session) => session.startDate)
    .sort((left, right) => (left.startDate?.getTime() ?? 0) - (right.startDate?.getTime() ?? 0));
  const now = Date.now();
  const ongoing = sessions.find((session) => {
    const start = session.startDate?.getTime() ?? 0;
    const end = session.endDate?.getTime();
    return start <= now && (end == null || now <= end);
  });

  if (ongoing) {
    return {
      isOngoing: true,
      label: "Lịch đang diễn ra",
      dateLabel: formatScheduleDate(ongoing.startDate, ongoing.endDate),
    };
  }

  const next = sessions.find((session) => (session.startDate?.getTime() ?? 0) > now);
  if (next) {
    return {
      isOngoing: false,
      label: "Lịch kế tiếp",
      dateLabel: formatScheduleDate(next.startDate, next.endDate),
    };
  }

  const classStart = course.registeredClass?.startDate;
  const classEnd = course.registeredClass?.endDate;
  if (classStart) {
    return {
      isOngoing: false,
      label: "Lịch học",
      dateLabel: formatScheduleDate(classStart, classEnd),
    };
  }

  return { isOngoing: false, label: "Lịch học", dateLabel: "Chưa có lịch học" };
}

function formatScheduleDate(startDate: Date | null | undefined, endDate: Date | null | undefined) {
  return `${formatTrainingDateTime(startDate)}${endDate ? ` - ${formatTrainingDateTime(endDate)}` : ""}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  classCount: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  classCard: { borderRadius: 18, marginBottom: 12 },
  classCardContent: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  classIcon: { width: 42, height: 42 },
  classCardCopy: { flex: 1, gap: 3, minWidth: 0 },
  className: { fontWeight: "800" },
  classLabel: { fontSize: 12, lineHeight: 17 },
  scheduleRow: { flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 2 },
  scheduleCopy: { flex: 1, minWidth: 0, gap: 1 },
  scheduleLabel: { fontSize: 12, lineHeight: 17, fontWeight: "700" },
  scheduleDate: { fontSize: 12, lineHeight: 17 },
  emptyCard: { borderWidth: 1, borderRadius: 20 },
});
