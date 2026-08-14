import AppHeader from "@/components/app-header";
import { TrainingCourseCard, TrainingEmptyState } from "@/components/training/training-presentational";
import { useTrainingResource } from "@/hooks/useTraining";
import { getTrainingCoursesApi, getMyTrainingCoursesApi, registerTrainingCourseApi, cancelTrainingCourseApi, getMyTrainingProposalsApi, proposeTrainingContentApi, deleteTrainingProposalApi } from "@/services/training.service";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Dialog, IconButton, Portal, Searchbar, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingCourseRegistrationScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const userId = user?.id;
  const { showToast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState("available");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalCourseId, setProposalCourseId] = useState("");
  const [proposalContent, setProposalContent] = useState("");
  const [proposalProcessing, setProposalProcessing] = useState(false);

  const load = useCallback(async () => {
    const [courses, registered] = await Promise.all([
      getTrainingCoursesApi(year, false),
      userId ? getMyTrainingCoursesApi(userId, year, { isDeployedCourse: false }) : Promise.resolve([]),
    ]);
    const registeredIds = new Set(registered.map((item) => item.id));
    return courses.map((course) => ({ ...course, isRegistered: course.isRegistered || registeredIds.has(course.id) }));
  }, [userId, year]);
  const { data: courses, loading, reload } = useTrainingResource(load, [year, userId]);
  const proposalLoad = useCallback(() => userId ? getMyTrainingProposalsApi(userId, year) : Promise.resolve([]), [userId, year]);
  const { data: proposals, loading: proposalsLoading, reload: reloadProposals } = useTrainingResource(proposalLoad, [userId, year]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (courses ?? []).filter((course) => {
      const matchesTab = tab === "registered" ? course.isRegistered : !course.isRegistered;
      return matchesTab && (!query || `${course.name} ${course.description ?? ""}`.toLowerCase().includes(query));
    });
  }, [courses, search, tab]);

  const toggleRegistration = async (courseId: string, registered: boolean) => {
    if (!userId || processingId) return;
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

  const submitProposal = async () => {
    if (!proposalCourseId || !proposalContent.trim() || proposalProcessing) return;
    setProposalProcessing(true);
    try {
      await proposeTrainingContentApi({ courseId: proposalCourseId, content: proposalContent.trim() });
      showToast("Gửi đề xuất nội dung thành công", { type: "success" });
      setProposalOpen(false);
      setProposalContent("");
      await reloadProposals();
    } catch (error: any) {
      showToast(error?.message ?? "Không thể gửi đề xuất nội dung", { type: "error" });
    } finally {
      setProposalProcessing(false);
    }
  };

  const removeProposal = async (proposalId: string) => {
    try {
      await deleteTrainingProposalApi(proposalId);
      showToast("Đã xóa đề xuất", { type: "success" });
      await reloadProposals();
    } catch (error: any) {
      showToast(error?.message ?? "Không thể xóa đề xuất", { type: "error" });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <AppHeader
        title="Đăng ký khóa đào tạo"
        subtitle="Chọn khóa phù hợp với kế hoạch của bạn"
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
        <Card mode="outlined" style={[styles.introCard, { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer }]}>
          <Card.Content style={styles.introContent}>
            <View style={[styles.introIcon, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 24 }}>🎓</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="titleSmall" style={{ color: colors.onPrimaryContainer, fontWeight: "800" }}>Khóa đang mở đăng ký</Text>
              <Text style={{ color: colors.onPrimaryContainer, lineHeight: 19 }}>Đăng ký trước thời hạn để được ghi nhận vào kế hoạch đào tạo.</Text>
            </View>
          </Card.Content>
        </Card>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: "available", label: `Khóa có sẵn (${courses?.filter((item) => !item.isRegistered).length ?? 0})` },
            { value: "registered", label: `Đã đăng ký (${courses?.filter((item) => item.isRegistered).length ?? 0})` },
            { value: "proposals", label: `Đề xuất (${proposals?.length ?? 0})` },
          ]}
        />
        {tab !== "proposals" ? <Searchbar placeholder="Tìm khóa đào tạo..." value={search} onChangeText={setSearch} style={styles.search} /> : null}
        {tab === "proposals" ? <ProposalList proposals={proposals ?? []} courses={courses ?? []} loading={proposalsLoading} onCreate={() => setProposalOpen(true)} onDelete={(id) => void removeProposal(id)} /> : loading && !courses ? <LoadingScreen /> : filteredCourses.length ? filteredCourses.map((course) => (
          <TrainingCourseCard
            key={course.id}
            course={course}
            action={
              <Button
                mode={course.isRegistered ? "outlined" : "contained"}
                compact
                loading={processingId === course.id}
                disabled={!!processingId || (course.status !== 10 && !course.isRegistered)}
                onPress={() => void toggleRegistration(course.id, !!course.isRegistered)}
              >
                {course.isRegistered ? "Hủy đăng ký" : "Đăng ký"}
              </Button>
            }
          />
        )) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <TrainingEmptyState title="Chưa có khóa phù hợp" description="Thử đổi năm hoặc tìm kiếm với từ khóa khác." />
          </View>
        )}
      </ScrollView>
      <Portal><Dialog visible={proposalOpen} onDismiss={() => setProposalOpen(false)}><Dialog.Title>Đề xuất nội dung đào tạo</Dialog.Title><Dialog.Content><Text style={styles.dialogHint}>Chọn một danh mục đào tạo và mô tả nội dung bạn muốn đề xuất.</Text><View style={styles.courseChoices}>{(courses ?? []).slice(0, 8).map((course) => <Button key={course.id} compact mode={proposalCourseId === course.id ? "contained" : "outlined"} onPress={() => setProposalCourseId(course.id)}>{course.name}</Button>)}</View><TextInput mode="outlined" label="Nội dung đề xuất" multiline numberOfLines={5} value={proposalContent} onChangeText={setProposalContent} /></Dialog.Content><Dialog.Actions><Button onPress={() => setProposalOpen(false)}>Hủy</Button><Button loading={proposalProcessing} disabled={!proposalCourseId || !proposalContent.trim() || proposalProcessing} onPress={() => void submitProposal()}>Gửi đề xuất</Button></Dialog.Actions></Dialog></Portal>
    </SafeAreaView>
  );
}

function ProposalList({ proposals, courses, loading, onCreate, onDelete }: { proposals: import("@/types/training.model").TrainingProposal[]; courses: import("@/types/training.model").TrainingCourse[]; loading: boolean; onCreate: () => void; onDelete: (id: string) => void }) {
  const { colors } = useTheme();
  return <View style={styles.proposalList}><View style={styles.proposalHeader}><Text variant="titleMedium" style={styles.title}>Nội dung đã đề xuất</Text><Button mode="contained" compact icon="plus" onPress={onCreate}>Đề xuất</Button></View>{loading ? <Text>Đang tải đề xuất...</Text> : proposals.length ? proposals.map((proposal) => <Card key={proposal.id} mode="outlined" style={[styles.proposalCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Card.Content style={styles.proposalContent}><View style={{ flex: 1, gap: 5 }}><Text variant="titleSmall" style={styles.title}>{proposal.courseName ?? courses.find((course) => course.id === proposal.courseId)?.name ?? "Danh mục đào tạo"}</Text><Text style={{ color: colors.onSurfaceVariant, lineHeight: 20 }}>{proposal.content || "Chưa có nội dung mô tả."}</Text><Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{proposal.statusLabel ?? "Đang chờ xử lý"}</Text></View><IconButton icon="delete-outline" onPress={() => onDelete(proposal.id)} /></Card.Content></Card>) : <TrainingEmptyState icon="lightbulb-outline" title="Chưa có đề xuất" description="Gửi đề xuất để bổ sung nội dung đào tạo phù hợp với công việc." />}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  introCard: { borderRadius: 20, marginBottom: 16 },
  introContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  introIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  search: { marginVertical: 14, borderRadius: 16 },
  emptyCard: { borderWidth: 1, borderRadius: 20 },
  title: { fontWeight: "800" },
  proposalList: { gap: 12 },
  proposalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  proposalCard: { borderRadius: 18 },
  proposalContent: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  dialogHint: { color: "#5B667A", lineHeight: 20, marginBottom: 12 },
  courseChoices: { gap: 8, marginBottom: 14 },
});
