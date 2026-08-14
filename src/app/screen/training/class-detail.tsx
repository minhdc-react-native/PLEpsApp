import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { SectionCard, SessionCard, TrainingEmptyState, TrainingStatusBadge } from "@/components/training/training-presentational";
import { useTrainingResource, formatTrainingDate } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { cancelTrainingClassApi, getMyTrainingClassesApi, getTrainingClassApi, getTrainingCourseApi, getTrainingCourseClassesApi, getTrainingRegistrationApi, registerTrainingClassApi, requestTrainingPostponeApi, getTrainingExamStudentsApi } from "@/services/training.service";
import { TrainingClass, TrainingCourse, TrainingStudentRegistration, TrainingExamSession } from "@/types/training.model";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Dialog, Divider, Portal, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";
import { trainingHref } from "@/utils/training-navigation";

type DetailPayload = {
  course: TrainingCourse | null;
  trainingClass: TrainingClass | null;
  registration: TrainingStudentRegistration | null;
  availableClasses: TrainingClass[];
  exams: TrainingExamSession[];
};

export default function TrainingClassDetailScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const userId = user?.id;
  const { showToast } = useToast();
  const { trainingCourseId } = useLocalSearchParams<{ trainingCourseId?: string }>();
  const [tab, setTab] = useState("sessions");
  const [processingClassId, setProcessingClassId] = useState<string | null>(null);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postponeReason, setPostponeReason] = useState("");
  const [postponing, setPostponing] = useState(false);

  const load = useCallback(async (): Promise<DetailPayload> => {
    if (!trainingCourseId || !userId) return { course: null, trainingClass: null, registration: null, availableClasses: [], exams: [] };
    const [course, registration, myClasses] = await Promise.all([
      getTrainingCourseApi(trainingCourseId),
      getTrainingRegistrationApi(userId, trainingCourseId),
      getMyTrainingClassesApi(trainingCourseId),
    ]);
    const registeredClassId = registration?.trainingClassId ?? myClasses[0]?.id ?? null;
    const courseClasses = registeredClassId || !course ? [] : await getTrainingCourseClassesApi(trainingCourseId);
    const onlineClass = course?.type === 0 ? courseClasses[0] ?? null : null;
    const trainingClass = registeredClassId ? await getTrainingClassApi(registeredClassId) : onlineClass;
    const availableClasses = trainingClass || course?.type === 0 ? [] : courseClasses;
    const exams = await getTrainingExamStudentsApi({ trainingCourseId, classId: course?.isSharedExam ? null : trainingClass?.id });
    return { course, trainingClass, registration, availableClasses, exams };
  }, [trainingCourseId, userId]);
  const { data, loading, error, reload } = useTrainingResource(load, [trainingCourseId, userId]);

  const registerClass = async (classId: string, isRegistered: boolean) => {
    if (processingClassId) return;
    setProcessingClassId(classId);
    try {
      if (isRegistered) {
        await cancelTrainingClassApi(classId);
        showToast("Đã hủy đăng ký lớp", { type: "success" });
      } else {
        await registerTrainingClassApi(classId);
        showToast("Đăng ký lớp thành công", { type: "success" });
      }
      await reload();
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Không thể cập nhật đăng ký lớp", { type: "error" });
    } finally {
      setProcessingClassId(null);
    }
  };

  const requestPostpone = async () => {
    if (!trainingCourseId || !postponeReason.trim() || postponing) return;
    setPostponing(true);
    try {
      await requestTrainingPostponeApi(trainingCourseId, postponeReason.trim());
      setPostponeOpen(false);
      setPostponeReason("");
      showToast("Đã gửi yêu cầu xin hoãn", { type: "success" });
      await reload();
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Không thể gửi yêu cầu xin hoãn", { type: "error" });
    } finally {
      setPostponing(false);
    }
  };

  if (loading && !data) return <LoadingScreen />;
  if (!data?.course || error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Chi tiết đào tạo" onBack={() => router.back()} />
        <TrainingEmptyState title="Không tải được khóa đào tạo" description="Vui lòng thử tải lại sau ít phút." />
      </SafeAreaView>
    );
  }

  const { course, trainingClass, registration, availableClasses, exams } = data;
  const isOnline = course.type === 0;
  const isPostponed = registration?.isPostponed === true;
  const classRegistrationOpen = course.status === 40 && isWithinRegistrationWindow(course.classRegistrationStartDate, course.classRegistrationEndDate);
  const canChooseClass = !isPostponed && classRegistrationOpen;
  const sessions = trainingClass?.sessions ?? [];
  const attendanceBySession = new Map((registration?.classSessions ?? []).map((item) => [item.id, item]));
  const score = registration?.score;
  const result = evaluateTrainingScore(score, trainingClass?.scoreConfig);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <AppHeader title={isOnline ? course.name : trainingClass?.name ?? course.name} subtitle={isOnline ? "Khóa học trực tuyến" : "Chi tiết lớp học"} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
        <Card mode="outlined" style={[styles.courseHeader, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <Card.Content style={styles.courseHeaderContent}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="titleLarge" style={styles.title}>{course.name}</Text>
              <View style={styles.metaRow}><TrainingStatusBadge status={course.status} /><Text style={{ color: colors.onSurfaceVariant }}>{course.year ?? ""}</Text></View>
              <Text style={{ color: colors.onSurfaceVariant, lineHeight: 19 }}>{course.description || "Chưa có mô tả khóa học."}</Text>
            </View>
          </Card.Content>
        </Card>

        {course.status === 30 ? <SectionCard title="Chờ triển khai" icon="clock-outline"><TrainingEmptyState icon="clock-outline" title="Khóa học đang chờ triển khai" description="Bạn sẽ có thể xem lớp học và lịch học sau khi khóa được triển khai." /></SectionCard> : null}
        {isPostponed ? <SectionCard title="Đã xin hoãn đào tạo" icon="calendar-remove-outline"><Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>Yêu cầu của bạn đã được ghi nhận. Khóa học đang ở chế độ chỉ xem.</Text><Text style={{ color: colors.onSurfaceVariant }}>{registration?.regStatus?.reason ?? registration?.finalRegStatus?.reason ?? "Chưa có lý do chi tiết."}</Text></SectionCard> : null}
        {!trainingClass && !isOnline && course.status !== 30 ? (
          <SectionCard title="Chọn lớp học" icon="account-group-outline">
            <Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>{classRegistrationOpen ? "Bạn chưa được xếp lớp. Chọn một lớp phù hợp để đăng ký." : "Thời gian đăng ký lớp chưa mở hoặc đã kết thúc."}</Text>
            {availableClasses.length ? availableClasses.map((item) => (
              <Card key={item.id} mode="outlined" style={[styles.classOption, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
                <Card.Content style={styles.optionContent}>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text variant="titleSmall" style={styles.title}>{item.name}</Text>
                    <Text style={{ color: colors.onSurfaceVariant }}>{item.studentCount} học viên · {item.sessionCount} buổi</Text>
                    <Text style={{ color: colors.onSurfaceVariant }}>{formatTrainingDate(item.startDate)} - {formatTrainingDate(item.endDate)}</Text>
                  </View>
                  <Button
                    mode={item.isRegistered ? "outlined" : "contained"}
                    compact
                    loading={processingClassId === item.id}
                    onPress={() => void registerClass(item.id, !!item.isRegistered)}
                    disabled={!!processingClassId || !canChooseClass}
                  >{item.isRegistered ? "Hủy" : "Đăng ký"}</Button>
                </Card.Content>
              </Card>
            )) : <TrainingEmptyState icon="account-group-outline" title="Chưa có lớp để đăng ký" />}
          </SectionCard>
        ) : null}

        {!trainingClass && !isOnline && course.status === 40 && !isPostponed ? <Button mode="outlined" icon="calendar-remove-outline" onPress={() => setPostponeOpen(true)}>Xin hoãn đào tạo</Button> : null}

        {trainingClass || isOnline ? (
          <>
            <SegmentedButtons
              value={tab}
              onValueChange={setTab}
              buttons={[{ value: "sessions", label: `Buổi học (${sessions.length})`, icon: "calendar-outline" }, { value: "exams", label: `Bài thi (${exams.length})`, icon: "clipboard-text-outline" }, { value: "result", label: "Kết quả", icon: "chart-box-outline" }]}
            />
            {tab === "sessions" ? (
              <View style={styles.list}>
                {sessions.length ? sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    attendanceLabel={attendanceBySession.get(session.id)?.isPresent === true ? "Đã điểm danh" : attendanceBySession.has(session.id) ? "Chưa điểm danh" : undefined}
                  onPress={() => router.push(trainingHref(`/screen/training/session-detail?trainingCourseId=${encodeURIComponent(course.id)}&sessionId=${encodeURIComponent(session.id)}&isOnline=${isOnline ? "true" : "false"}`))}
                  />
                )) : <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><TrainingEmptyState icon={isOnline ? "laptop-account" : "calendar-outline"} title="Chưa có buổi học" description={isOnline ? "Nội dung trực tuyến sẽ được cập nhật theo lịch triển khai." : undefined} /></View>}
              </View>
            ) : tab === "exams" ? (
              <View style={styles.list}>{exams.length ? exams.map((exam) => <Card key={exam.examId || exam.id} mode="outlined" style={[styles.examCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => router.push(trainingHref(`/screen/training/exam-session?examId=${encodeURIComponent(exam.examId)}`))}><Card.Content style={styles.examContent}><View style={{ flex: 1, gap: 5 }}><Text variant="titleSmall" style={styles.title}>{exam.title}</Text><Text style={{ color: colors.onSurfaceVariant }}>{exam.durationMinutes ? `${exam.durationMinutes} phút` : "Không giới hạn thời gian"}{exam.score != null ? ` · Điểm: ${exam.score}` : ""}</Text></View><Badge variant={exam.status === "result" || exam.status === "submitted" ? "success" : exam.status === "in_progress" ? "primary" : "default"}>{exam.status === "not_started" ? "Bắt đầu" : exam.status === "in_progress" ? "Làm tiếp" : "Xem bài làm"}</Badge></Card.Content></Card>) : <TrainingEmptyState icon="clipboard-text-outline" title="Chưa có bài thi" description="Bài thi sẽ hiển thị khi được triển khai cho khóa học." />}</View>
            ) : (
              <SectionCard title="Kết quả học tập" icon="trophy-outline">
                {score == null ? <TrainingEmptyState icon="chart-box-outline" title="Chưa có kết quả" description="Kết quả sẽ hiển thị sau khi khóa học hoàn tất." /> : (
                  <View style={styles.resultList}>
                    <ResultRow label="Điểm tổng kết" value={String(score)} />
                    <Divider />
                    <ResultRow label="Kết quả" value={result.isPass == null ? "Chưa xác định" : result.isPass ? "Đạt" : "Không đạt"} badge={result.isPass == null ? "default" : result.isPass ? "success" : "error"} />
                    <Divider />
                    <ResultRow label="Xếp loại" value={result.bandLabel ?? "Chưa xác định"} />
                  </View>
                )}
              </SectionCard>
            )}
          </>
        ) : null}
      </ScrollView>
      <Portal><Dialog visible={postponeOpen} onDismiss={() => setPostponeOpen(false)}><Dialog.Title>Xin hoãn đào tạo</Dialog.Title><Dialog.Content><Text style={styles.helper}>Vui lòng cho biết lý do để đơn vị đào tạo xem xét.</Text><TextInput mode="outlined" label="Lý do xin hoãn" multiline numberOfLines={4} value={postponeReason} onChangeText={setPostponeReason} /></Dialog.Content><Dialog.Actions><Button onPress={() => setPostponeOpen(false)}>Hủy</Button><Button loading={postponing} disabled={!postponeReason.trim() || postponing} onPress={() => void requestPostpone()}>Gửi yêu cầu</Button></Dialog.Actions></Dialog></Portal>
    </SafeAreaView>
  );
}

function ResultRow({ label, value, badge }: { label: string; value: string; badge?: "default" | "success" | "error" }) {
  return <View style={styles.resultRow}><Text style={{ color: "#5B667A" }}>{label}</Text>{badge ? <Badge variant={badge}>{value}</Badge> : <Text style={styles.resultValue}>{value}</Text>}</View>;
}

function evaluateTrainingScore(score: number | null | undefined, config?: TrainingClass["scoreConfig"]) {
  if (score == null || !config) return { isPass: null as boolean | null, bandLabel: null as string | null };
  if (config.bands?.length) {
    const band = [...config.bands].sort((a, b) => b.minScore - a.minScore).find((item) => score >= item.minScore);
    return { isPass: band?.isPass ?? null, bandLabel: band?.label ?? null };
  }
  return { isPass: config.passingScore == null ? null : score >= config.passingScore, bandLabel: null };
}

function isWithinRegistrationWindow(start?: Date | null, end?: Date | null) {
  const now = Date.now();
  return (!start || now >= start.getTime()) && (!end || now <= end.getTime());
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  courseHeader: { borderRadius: 20 },
  courseHeaderContent: { paddingVertical: 16 },
  title: { fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  helper: { lineHeight: 20, marginBottom: 12 },
  classOption: { borderRadius: 16, marginBottom: 10 },
  optionContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  list: { gap: 0 },
  emptyCard: { borderWidth: 1, borderRadius: 20 },
  resultList: { gap: 14 },
  resultRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  resultValue: { fontWeight: "800", fontSize: 16 },
  examCard: { borderRadius: 18, marginBottom: 10 },
  examContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
});
