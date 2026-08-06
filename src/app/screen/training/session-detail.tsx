import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { FileBadge } from "@/components/file-badge";
import { SectionCard } from "@/components/training/training-presentational";
import { formatTrainingDateTime, useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { getTrainingRegistrationApi, getTrainingSessionApi, markTrainingSessionAttendanceApi } from "@/services/training.service";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingSessionDetailScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const userId = user?.id;
  const { showToast } = useToast();
  const { trainingCourseId, sessionId } = useLocalSearchParams<{ trainingCourseId?: string; sessionId?: string }>();
  const [marking, setMarking] = useState(false);
  const load = useCallback(async () => {
    if (!sessionId || !trainingCourseId || !userId) return { session: null, registration: null };
    const [session, registration] = await Promise.all([
      getTrainingSessionApi(sessionId),
      getTrainingRegistrationApi(userId, trainingCourseId),
    ]);
    return { session, registration };
  }, [sessionId, trainingCourseId, userId]);
  const { data, loading, error, reload } = useTrainingResource(load, [sessionId, trainingCourseId, userId]);

  const attendance = data?.registration?.classSessions.find((item) => item.id === sessionId);
  const session = data?.session;
  const isPresent = attendance?.isPresent === true;
  const canMarkAttendance = session?.status === 1 && !isPresent;

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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Chi tiết buổi học" onBack={() => router.back()} />
        <View style={styles.error}><Text>Không tìm thấy buổi học.</Text></View>
      </SafeAreaView>
    );
  }

  const statusLabel = session.status === 1 ? "Đang diễn ra" : session.status === 2 ? "Đã kết thúc" : "Chưa bắt đầu";
  const statusVariant = session.status === 1 ? "primary" : session.status === 2 ? "success" : "default";
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <AppHeader title={session.name} subtitle={statusLabel} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
        <Card mode="outlined" style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <Card.Content style={styles.heroContent}>
            <View style={[styles.statusIcon, { backgroundColor: colors.primaryContainer }]}>
              <Text style={{ fontSize: 25 }}>📚</Text>
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text variant="titleLarge" style={styles.title}>{session.name}</Text>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </View>
          </Card.Content>
        </Card>

        <SectionCard title="Thông tin buổi học" icon="information-outline">
          <View style={styles.infoList}>
            <InfoRow label="Thời gian bắt đầu" value={formatTrainingDateTime(session.startDate)} />
            <Divider />
            <InfoRow label="Thời gian kết thúc" value={formatTrainingDateTime(session.endDate)} />
            <Divider />
            <InfoRow label="Mô tả" value={session.description || "Chưa có mô tả."} multiline />
          </View>
        </SectionCard>

        <SectionCard title="Điểm danh" icon="calendar-check-outline">
          <View style={styles.attendanceBox}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text variant="titleSmall" style={styles.title}>{isPresent ? "Bạn đã điểm danh" : attendance ? "Chưa điểm danh" : "Chưa có dữ liệu"}</Text>
              <Text style={{ color: colors.onSurfaceVariant }}>{attendance?.attendanceTime ? `Lúc ${formatTrainingDateTime(attendance.attendanceTime)}` : "Chỉ có thể điểm danh khi buổi học đang diễn ra."}</Text>
            </View>
            <Button mode={isPresent ? "outlined" : "contained"} disabled={!canMarkAttendance} loading={marking} onPress={() => void markAttendance()}>
              {isPresent ? "Đã điểm danh" : "Điểm danh"}
            </Button>
          </View>
        </SectionCard>

        <SectionCard title="Tài liệu" icon="file-document-multiple-outline">
          {session.fileIds.length || session.files.length ? (
            <FileBadge files={session.files.length ? session.files : session.fileIds.map((id) => ({ id }))} />
          ) : <Text style={{ color: colors.onSurfaceVariant }}>Chưa có tài liệu.</Text>}
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return <View style={[styles.infoRow, multiline && styles.multiline]}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  heroCard: { borderRadius: 20 },
  heroContent: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16 },
  statusIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "800" },
  infoList: { gap: 13 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  multiline: { alignItems: "flex-start" },
  infoLabel: { color: "#5B667A", flex: 0.9 },
  infoValue: { fontWeight: "700", flex: 1.3, textAlign: "right", lineHeight: 20 },
  attendanceBox: { flexDirection: "row", alignItems: "center", gap: 12 },
  error: { flex: 1, alignItems: "center", justifyContent: "center" },
});
