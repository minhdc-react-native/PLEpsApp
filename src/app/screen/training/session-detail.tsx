import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { FileBadge } from "@/components/file-badge";
import { SectionCard } from "@/components/training/training-presentational";
import { formatTrainingDateTime, useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { getTrainingCourseApi, getTrainingRegistrationApi, getTrainingSessionApi, markTrainingSessionAttendanceApi } from "@/services/training.service";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, Text, useTheme } from "react-native-paper";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingSessionDetailScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const { showToast } = useToast();
  const { trainingCourseId, sessionId, isOnline, trainingClassName } = useLocalSearchParams<{ trainingCourseId?: string; sessionId?: string; isOnline?: string; trainingClassName?: string }>();
  const [marking, setMarking] = useState(false);
  const load = useCallback(async () => {
    if (!sessionId || !trainingCourseId || !employeeId) return { course: null, session: null, registration: null };
    const [course, session, registration] = await Promise.all([
      getTrainingCourseApi(trainingCourseId),
      getTrainingSessionApi(sessionId),
      getTrainingRegistrationApi(employeeId, trainingCourseId),
    ]);
    return { course, session, registration };
  }, [sessionId, trainingCourseId, employeeId]);
  const { data, loading, error, reload } = useTrainingResource(load, [sessionId, trainingCourseId, employeeId]);

  const attendance = data?.registration?.classSessions.find((item) => item.id === sessionId);
  const session = data?.session;
  const isOnlineSession = data?.course?.type === 0 || isOnline === "true";
  const isPresent = attendance?.isPresent === true;
  const canMarkAttendance = !isOnlineSession && session?.status === 1 && !isPresent;

  const markAttendance = async () => {
    if (!sessionId || !canMarkAttendance) return;
    setMarking(true);
    try {
      await markTrainingSessionAttendanceApi(sessionId);
      showToast("Điểm danh thành công", { type: "success" });
      await reload();
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Điểm danh thất bại", { type: "error" });
    } finally {
      setMarking(false);
    }
  };

  if (loading && !data) return <LoadingScreen />;
  if (!session || error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Chi tiết buổi học" onBack={() => router.back()} />
        <View style={styles.error}><Text>Không tìm thấy buổi học.</Text></View>
      </View>
    );
  }

  const statusLabel = session.status === 1 ? "Đang diễn ra" : session.status === 2 ? "Đã kết thúc" : "Chưa bắt đầu";
  const statusVariant = session.status === 1 ? "primary" : session.status === 2 ? "success" : "default";
  const attendanceLabel = session.status === 0 ? "Chưa bắt đầu" : isPresent ? "Đã điểm danh" : "Chưa điểm danh";
  const attendanceVariant = session.status === 0 ? "default" : isPresent ? "success" : "error";
  const attendanceTime = formatAttendanceTime(attendance?.attendanceTime);
  const attendanceDelay = formatAttendanceDelay({ attendanceTime: attendance?.attendanceTime, startDate: session.startDate });
  const attendanceWindowOpen = !isOnlineSession && session.status === 1;
  const className = trainingClassName || data?.registration?.className || "Khóa đào tạo";
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={session.name} subtitle={className} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
        <SectionCard title="Thông tin buổi học" icon="information-outline">
          <View style={styles.infoList}>
            <InfoRow label="Trạng thái" value={<View style={styles.badgeValue}><Badge variant={statusVariant}>{statusLabel}</Badge></View>} />
            <Divider />
            <InfoRow label="Thời gian bắt đầu" value={formatTrainingDateTime(session.startDate)} />
            <Divider />
            <InfoRow label="Thời gian kết thúc" value={formatTrainingDateTime(session.endDate)} />
            {!isOnlineSession ? <>
              <Divider />
              <InfoRow
                label="Điểm danh"
                value={
                  <View style={styles.attendanceValue}>
                    <Badge variant={attendanceVariant}>{attendanceLabel}</Badge>
                    {attendanceWindowOpen ? <Button mode={isPresent ? "outlined" : "contained"} compact disabled={isPresent || marking} loading={marking} onPress={() => void markAttendance()}>{isPresent ? "Đã điểm danh" : "Điểm danh"}</Button> : null}
                  </View>
                }
              />
              <Divider />
              <InfoRow label="Điểm danh lúc" value={<Text style={styles.infoValueText}>{attendanceTime}{attendanceDelay ? <Text style={{ color: colors.error }}> ({attendanceDelay})</Text> : null}</Text>} />
            </> : null}
            <Divider />
            <InfoRow label="Mô tả" value={session.description || "Chưa có mô tả."} multiline />
          </View>
        </SectionCard>

        <SectionCard title="Tài liệu" icon="file-document-multiple-outline">
          {session.fileIds.length || session.files.length ? (
            <FileBadge files={session.files.length ? session.files : session.fileIds.map((id) => ({ id }))} />
          ) : <Text style={{ color: colors.onSurfaceVariant }}>Chưa có tài liệu.</Text>}
        </SectionCard>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, multiline }: { label: string; value: React.ReactNode; multiline?: boolean }) {
  return <View style={[styles.infoRow, multiline && styles.multiline]}><Text style={styles.infoLabel}>{label}</Text><View style={styles.infoValue}>{typeof value === "string" ? <Text style={styles.infoValueText}>{value}</Text> : value}</View></View>;
}

function formatAttendanceTime(value: Date | null | undefined) {
  if (!value) return "Chưa có";
  return value.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatAttendanceDelay({ attendanceTime, startDate }: { attendanceTime?: Date | null; startDate?: Date | null }) {
  if (!attendanceTime || !startDate) return null;
  const lateSeconds = Math.floor((attendanceTime.getTime() - startDate.getTime()) / 1000);
  if (lateSeconds <= 0) return null;
  if (lateSeconds < 60) return `trễ ${lateSeconds} giây`;
  const lateMinutes = Math.floor(lateSeconds / 60);
  if (lateMinutes < 60) return `trễ ${lateMinutes} phút`;
  return `trễ ${Math.floor(lateMinutes / 60)} giờ`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  infoList: { gap: 13 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  multiline: { alignItems: "flex-start" },
  infoLabel: { color: "#5B667A", flex: 0.9 },
  infoValue: { flex: 1.3, alignItems: "flex-end" },
  infoValueText: { fontWeight: "700", textAlign: "right", lineHeight: 20 },
  badgeValue: { alignSelf: "flex-end" },
  attendanceValue: { alignItems: "flex-end", gap: 8 },
  error: { flex: 1, alignItems: "center", justifyContent: "center" },
});
