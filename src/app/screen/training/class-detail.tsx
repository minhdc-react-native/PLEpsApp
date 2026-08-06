import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { SectionCard, SessionCard, TrainingEmptyState, TrainingStatusBadge } from "@/components/training/training-presentational";
import { useTrainingResource, formatTrainingDate } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { cancelTrainingClassApi, getMyTrainingClassesApi, getTrainingClassApi, getTrainingCourseApi, getTrainingCourseClassesApi, getTrainingRegistrationApi, registerTrainingClassApi } from "@/services/training.service";
import { TrainingClass, TrainingCourse, TrainingStudentRegistration } from "@/types/training.model";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";
import { trainingHref } from "@/utils/training-navigation";

type DetailPayload = {
  course: TrainingCourse | null;
  trainingClass: TrainingClass | null;
  registration: TrainingStudentRegistration | null;
  availableClasses: TrainingClass[];
};

export default function TrainingClassDetailScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const userId = user?.id;
  const { showToast } = useToast();
  const { trainingCourseId } = useLocalSearchParams<{ trainingCourseId?: string }>();
  const [tab, setTab] = useState("sessions");
  const [processingClassId, setProcessingClassId] = useState<string | null>(null);

  const load = useCallback(async (): Promise<DetailPayload> => {
    if (!trainingCourseId || !userId) return { course: null, trainingClass: null, registration: null, availableClasses: [] };
    const [course, registration, myClasses] = await Promise.all([
      getTrainingCourseApi(trainingCourseId),
      getTrainingRegistrationApi(userId, trainingCourseId),
      getMyTrainingClassesApi(trainingCourseId),
    ]);
    const registeredClassId = registration?.trainingClassId ?? myClasses[0]?.id ?? null;
    const trainingClass = registeredClassId ? await getTrainingClassApi(registeredClassId) : null;
    const availableClasses = trainingClass ? [] : await getTrainingCourseClassesApi(trainingCourseId);
    return { course, trainingClass, registration, availableClasses };
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

  if (loading && !data) return <LoadingScreen />;
  if (!data?.course || error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Chi tiết đào tạo" onBack={() => router.back()} />
        <TrainingEmptyState title="Không tải được khóa đào tạo" description="Vui lòng thử tải lại sau ít phút." />
      </SafeAreaView>
    );
  }

  const { course, trainingClass, registration, availableClasses } = data;
  const isOnline = course.type === 0;
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

        {!trainingClass && !isOnline ? (
          <SectionCard title="Chọn lớp học" icon="account-group-outline">
            <Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>Bạn chưa được xếp lớp. Chọn một lớp phù hợp để đăng ký.</Text>
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
                    disabled={!!processingClassId}
                    onPress={() => void registerClass(item.id, !!item.isRegistered)}
                  >{item.isRegistered ? "Hủy" : "Đăng ký"}</Button>
                </Card.Content>
              </Card>
            )) : <TrainingEmptyState icon="account-group-outline" title="Chưa có lớp để đăng ký" />}
          </SectionCard>
        ) : null}

        {trainingClass || isOnline ? (
          <>
            <SegmentedButtons
              value={tab}
              onValueChange={setTab}
              buttons={[{ value: "sessions", label: `Buổi học (${trainingClass?.sessions.length ?? 0})`, icon: "calendar-outline" }, { value: "result", label: "Kết quả", icon: "chart-box-outline" }]}
            />
            {tab === "sessions" ? (
              <View style={styles.list}>
                {isOnline ? <TrainingEmptyState icon="laptop-account" title="Khóa học trực tuyến" description="Nội dung tự học và tài liệu sẽ được cập nhật theo từng buổi học." /> : trainingClass?.sessions.length ? trainingClass.sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    attendanceLabel={attendanceBySession.get(session.id)?.isPresent === true ? "Đã điểm danh" : attendanceBySession.has(session.id) ? "Chưa điểm danh" : undefined}
                  onPress={() => router.push(trainingHref(`/screen/training/session-detail?trainingCourseId=${encodeURIComponent(course.id)}&sessionId=${encodeURIComponent(session.id)}`))}
                  />
                )) : <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><TrainingEmptyState title="Chưa có buổi học" /></View>}
              </View>
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
});
