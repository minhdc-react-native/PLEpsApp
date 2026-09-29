import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { TrainingCourseCard } from "@/components/training/training-presentational";
import { formatTrainingDate, useTrainingResource } from "@/hooks/useTraining";
import { cancelTrainingCourseApi, getMyTrainingRegistrationSummariesApi, getTrainingCoursesApi, registerTrainingCourseApi } from "@/services/training.service";
import { MyTrainingCourse, TRAINING_COURSE_STATUS, TRAINING_REGISTRATION_STATUS, TrainingRegistrationRecord } from "@/types/training.model";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, IconButton, Text, useTheme } from "react-native-paper";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingCourseRegistrationScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const { showToast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState<"registered" | "available" | "all">("registered");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [courses, registered] = await Promise.all([
      getTrainingCoursesApi(year, true, TRAINING_COURSE_STATUS.REGISTRATION, user?.department?.id),
      employeeId ? getMyTrainingRegistrationSummariesApi(employeeId, year) : Promise.resolve([]),
    ]);
    const registeredById = new Map(registered.map((item) => [item.trainingCourseId, item]));
    return courses.map((course): MyTrainingCourse => {
      const registeredCourse = registeredById.get(course.id);
      return {
        ...course,
        isRegistered: !!registeredCourse,
        regStatus: registeredCourse?.regStatus ?? null,
        departmentRegStatus: registeredCourse?.departmentRegStatus ?? null,
        adminRegStatus: registeredCourse?.adminRegStatus ?? null,
        finalRegStatus: registeredCourse?.finalRegStatus ?? null,
      };
    });
  }, [employeeId, user?.department?.id, year]);
  const { data: courses, loading, reload } = useTrainingResource(load, [year, employeeId]);
  const filteredCourses = useMemo(() => {
    const allCourses = courses ?? [];
    if (tab === "registered") return allCourses.filter((course) => course.isRegistered);
    if (tab === "all") return allCourses;
    return allCourses.filter((course) => !course.isRegistered && isCourseRegistrationCurrentlyOpen(course));
  }, [courses, tab]);

  const toggleRegistration = async (courseId: string, registered: boolean) => {
    if (!employeeId || processingId) return;
    setProcessingId(courseId);
    try {
      if (registered) {
        await cancelTrainingCourseApi(courseId);
        showToast("Đã hủy đăng ký khóa học", { type: "success" });
      } else {
        await registerTrainingCourseApi(courseId);
        showToast("Đăng ký khóa học thành công", { type: "success" });
      }
      await reload();
    } catch (error: any) {
      showToast(error?.message ?? "Không thể cập nhật đăng ký", { type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Đăng ký khóa"
        onBack={() => router.back()}
        actions={
          <View style={styles.yearActions}>
            <IconButton icon="chevron-left" size={20} onPress={() => setYear((value) => value - 1)} />
            <Text style={styles.year}>{year}</Text>
            <IconButton icon="chevron-right" size={20} onPress={() => setYear((value) => value + 1)} />
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabChips}>
          <Chip mode={tab === "registered" ? "outlined" : "flat"} onPress={() => setTab("registered")} style={styles.tabChip} textStyle={tab === "registered" ? styles.activeTabText : undefined}>Đã đăng ký ({courses?.filter((item) => item.isRegistered).length ?? 0})</Chip>
          <Chip mode={tab === "available" ? "outlined" : "flat"} onPress={() => setTab("available")} style={styles.tabChip} textStyle={tab === "available" ? styles.activeTabText : undefined}>Có thể đăng ký ({courses?.filter((item) => !item.isRegistered && isCourseRegistrationCurrentlyOpen(item)).length ?? 0})</Chip>
          <Chip mode={tab === "all" ? "outlined" : "flat"} onPress={() => setTab("all")} style={styles.tabChip} textStyle={tab === "all" ? styles.activeTabText : undefined}>Tất cả ({courses?.length ?? 0})</Chip>
        </ScrollView>
        {loading && !courses ? <LoadingScreen /> : filteredCourses.length ? filteredCourses.map((course) => {
          const registrationState = getRegistrationState(course);
          return (
            <TrainingCourseCard
              key={course.id}
              course={course}
              statusBadge={course.isRegistered ? registrationState.badge : null}
              meta={<RegistrationSchedule course={course} />}
              action={
                <Button
                  mode={course.isRegistered ? "outlined" : "contained"}
                  compact
                  loading={processingId === course.id}
                  disabled={!!processingId || !isCourseRegistrationCurrentlyOpen(course) || (course.isRegistered && !registrationState.canCancel)}
                  onPress={() => void toggleRegistration(course.id, !!course.isRegistered)}
                >
                  {course.isRegistered ? "Hủy đăng ký" : "Đăng ký"}
                </Button>
              }
            />
          );
        }) : <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Chưa có khóa phù hợp</Text>}
      </ScrollView>
    </View>
  );
}

function getRegistrationState(course: MyTrainingCourse) {
  const canCancel = !course.adminRegStatus && !course.departmentRegStatus;
  const finalStatus = course.finalRegStatus?.status;
  if (finalStatus != null) {
    const finalStatusInfo: Record<number, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
      [TRAINING_REGISTRATION_STATUS.PENDING]: { label: "Chưa xác nhận", variant: "warning" },
      [TRAINING_REGISTRATION_STATUS.SIGNED]: { label: "Tham gia", variant: "success" },
      [TRAINING_REGISTRATION_STATUS.REJECTED]: { label: "Từ chối", variant: "error" },
      [TRAINING_REGISTRATION_STATUS.ADDED]: { label: "Bổ sung", variant: "success" },
      [TRAINING_REGISTRATION_STATUS.POSTPONED]: { label: "Hoãn", variant: "warning" },
      [TRAINING_REGISTRATION_STATUS.CANCELED]: { label: "Đã hủy", variant: "error" },
    };
    const status = finalStatusInfo[finalStatus];
    return {
      canCancel,
      badge: status ? <Badge variant={status.variant}>{status.label}</Badge> : null,
    };
  }

  const reviewSources: Array<[
    "admin" | "phòng ban",
    TrainingRegistrationRecord | null | undefined,
  ]> = [
    ["admin", course.adminRegStatus],
    ["phòng ban", course.departmentRegStatus],
  ];
  const reviewSource = reviewSources.find(([, record]) => record != null);

  if (!reviewSource) {
    return { canCancel, badge: null };
  }

  const badgeSource =
    reviewSources.find(([, record]) =>
      [
        TRAINING_REGISTRATION_STATUS.ADDED,
        TRAINING_REGISTRATION_STATUS.REJECTED,
        -1,
      ].includes(record?.status ?? NaN),
    ) ?? reviewSource;
  const source = badgeSource[0];
  const record = badgeSource[1];

  if (record?.status === TRAINING_REGISTRATION_STATUS.ADDED) {
    return {
      canCancel: false,
      badge: <Badge variant="success">Bổ sung bởi {source}</Badge>,
    };
  }
  if (record?.status === TRAINING_REGISTRATION_STATUS.REJECTED) {
    return {
      canCancel: false,
      badge: <Badge variant="error">Từ chối bởi {source}</Badge>,
    };
  }
  if (record?.status === -1) {
    return {
      canCancel: false,
      badge: <Badge variant="error">Đã hủy bởi {source}</Badge>,
    };
  }

  return { canCancel: false, badge: null };
}

function RegistrationSchedule({ course }: { course: MyTrainingCourse }) {
  const { colors } = useTheme();
  const start = course.registrationStartDate;
  const end = course.registrationEndDate;
  const state = getCourseRegistrationWindowState(course);
  const label = state === "not-started"
    ? `Mở đăng ký: ${formatTrainingDate(start)}`
    : state === "closed"
      ? "Đã đóng"
      : start || end
        ? `Lịch đăng ký: ${formatTrainingDate(start)} - ${formatTrainingDate(end)}`
        : "Chưa có lịch đăng ký";
  return <Text style={[styles.registrationSchedule, { color: state === "closed" ? colors.error : colors.onSurfaceVariant }]}>{label}</Text>;
}

function getCourseRegistrationWindowState(course: MyTrainingCourse): "open" | "not-started" | "closed" {
  if (course.status !== TRAINING_COURSE_STATUS.REGISTRATION) return "closed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = course.registrationStartDate ? new Date(course.registrationStartDate) : null;
  const end = course.registrationEndDate ? new Date(course.registrationEndDate) : null;
  if (!start || !end) return "open";
  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(0, 0, 0, 0);
  if (start && today < start) return "not-started";
  if (end && today > end) return "closed";
  return "open";
}

function isCourseRegistrationCurrentlyOpen(course: MyTrainingCourse) {
  if (course.status !== TRAINING_COURSE_STATUS.REGISTRATION) return false;
  if (!course.registrationStartDate || !course.registrationEndDate) return true;
  return getCourseRegistrationWindowState(course) === "open";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  registrationSchedule: { fontSize: 12, lineHeight: 17 },
  tabScroll: { marginBottom: 10 },
  tabChips: { gap: 10, paddingVertical: 4, paddingHorizontal: 1 },
  tabChip: { flexShrink: 0 },
  activeTabText: { fontWeight: "700" },
  emptyText: { paddingVertical: 12, fontSize: 15 },
});
