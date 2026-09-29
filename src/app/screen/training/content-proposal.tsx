import AppHeader from "@/components/app-header";
import { TrainingEmptyState } from "@/components/training/training-presentational";
import { useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import {
  deleteTrainingProposalApi,
  getActiveTrainingCatalogCoursesApi,
  getMyTrainingProposalsApi,
  getTrainingCoursesApi,
  getTrainingYearPlanApi,
  proposeTrainingContentApi,
} from "@/services/training.service";
import {
  TrainingCatalogCourse,
  TrainingProposal,
  TRAINING_YEAR_PLAN_STATUS,
} from "@/types/training.model";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingContentProposalScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const { showToast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalCourseId, setProposalCourseId] = useState("");
  const [proposalContent, setProposalContent] = useState("");
  const [proposalProcessing, setProposalProcessing] = useState(false);

  const load = useCallback(async () => {
    const [proposals, trainingPlan, plannedCourses, catalogCourses] =
      await Promise.all([
        employeeId ? getMyTrainingProposalsApi(employeeId, year) : Promise.resolve([]),
        getTrainingYearPlanApi(year),
        getTrainingCoursesApi(year, false),
        getActiveTrainingCatalogCoursesApi(),
      ]);
    const existingCourseIds = new Set(
      plannedCourses
        .filter((course) => !course.isAdditional)
        .map((course) => course.courseId)
        .filter((courseId): courseId is string => !!courseId),
    );

    return {
      proposals,
      trainingPlan,
      catalogCourses,
      proposalCourses: catalogCourses.filter(
        (course) => !existingCourseIds.has(course.id),
      ),
    };
  }, [employeeId, year]);
  const { data, loading, reload } = useTrainingResource(load, [employeeId, year]);
  const proposals = data?.proposals ?? [];
  const canPropose = data?.trainingPlan?.status === TRAINING_YEAR_PLAN_STATUS.REGISTRATION;

  const closeProposal = () => {
    setProposalOpen(false);
    setProposalCourseId("");
    setProposalContent("");
  };

  const submitProposal = async () => {
    if (
      !canPropose ||
      !data?.trainingPlan?.id ||
      !proposalCourseId ||
      proposalProcessing
    ) return;

    setProposalProcessing(true);
    try {
      await proposeTrainingContentApi({
        planId: data.trainingPlan.id,
        courseId: proposalCourseId,
        content: proposalContent.trim() || null,
      });
      showToast("Gửi đề xuất nội dung thành công", { type: "success" });
      closeProposal();
      await reload();
    } catch (error: any) {
      showToast(error?.message ?? "Không thể gửi đề xuất nội dung", { type: "error" });
    } finally {
      setProposalProcessing(false);
    }
  };

  const removeProposal = async (proposalId: string) => {
    if (!canPropose) return;
    try {
      await deleteTrainingProposalApi(proposalId);
      showToast("Đã xóa đề xuất", { type: "success" });
      await reload();
    } catch (error: any) {
      showToast(error?.message ?? "Không thể xóa đề xuất", { type: "error" });
    }
  };

  const openProposal = () => {
    if (!canPropose) {
      showToast(`Kế hoạch đào tạo năm ${year} chưa mở giai đoạn đăng ký nội dung`, { type: "warning" });
      return;
    }
    setProposalOpen(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Đề xuất nội dung đào tạo"
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
        <View style={styles.proposalHeader}>
          <Text variant="titleMedium" style={styles.title}>Nội dung đã đề xuất</Text>
          <Button mode="contained" compact icon="plus" onPress={openProposal}>Đề xuất</Button>
        </View>
        {!canPropose ? (
          <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
            Chỉ có thể gửi hoặc xóa đề xuất trong giai đoạn đăng ký nội dung của kế hoạch năm.
          </Text>
        ) : null}
        {loading && !data ? <LoadingScreen /> : proposals.length ? proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            courses={data?.catalogCourses ?? []}
            canDelete={canPropose}
            onDelete={() => void removeProposal(proposal.id)}
          />
        )) : (
          <TrainingEmptyState
            icon="lightbulb-outline"
            title="Chưa có đề xuất"
            description="Gửi đề xuất để bổ sung nội dung đào tạo phù hợp với công việc."
          />
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={proposalOpen} onDismiss={closeProposal}>
          <Dialog.Title>Đề xuất danh mục đào tạo</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
              Chọn danh mục đào tạo và mô tả nội dung bạn muốn đề xuất.
            </Text>
            <ScrollView style={styles.courseChoices}>
              {(data?.proposalCourses ?? []).map((course: TrainingCatalogCourse) => (
                <Button
                  key={course.id}
                  compact
                  mode={proposalCourseId === course.id ? "contained" : "outlined"}
                  onPress={() => setProposalCourseId(course.id)}
                >
                  {course.name}
                </Button>
              ))}
              {!data?.proposalCourses.length ? (
                <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
                  Không có danh mục hiện hành để đề xuất.
                </Text>
              ) : null}
            </ScrollView>
            <TextInput
              mode="outlined"
              label="Nội dung chi tiết"
              placeholder="Nhập nội dung chi tiết"
              multiline
              numberOfLines={5}
              value={proposalContent}
              onChangeText={setProposalContent}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeProposal}>Hủy</Button>
            <Button
              loading={proposalProcessing}
              disabled={!canPropose || !proposalCourseId || proposalProcessing}
              onPress={() => void submitProposal()}
            >
              Gửi đề xuất
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function ProposalCard({
  proposal,
  courses,
  canDelete,
  onDelete,
}: {
  proposal: TrainingProposal;
  courses: TrainingCatalogCourse[];
  canDelete: boolean;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const courseName = proposal.courseName ?? courses.find((course) => course.id === proposal.courseId)?.name ?? "Danh mục đào tạo";

  return (
    <Card mode="outlined" style={[styles.proposalCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Card.Content style={styles.proposalContent}>
        <View style={styles.proposalCopy}>
          <Text variant="titleSmall" style={styles.title}>{courseName}</Text>
          <Text style={[styles.proposalDescription, { color: colors.onSurfaceVariant }]}>
            {proposal.content || "Chưa có nội dung mô tả."}
          </Text>
          <Text style={[styles.proposalStatus, { color: colors.onSurfaceVariant }]}>
            {proposal.statusLabel ?? "Đang chờ xử lý"}
          </Text>
        </View>
        {canDelete ? <IconButton icon="delete-outline" onPress={onDelete} /> : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  proposalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { fontWeight: "800" },
  hint: { lineHeight: 20, marginBottom: 12 },
  proposalCard: { borderRadius: 18, marginBottom: 12 },
  proposalContent: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  proposalCopy: { flex: 1, gap: 5 },
  proposalDescription: { lineHeight: 20 },
  proposalStatus: { fontSize: 12 },
  courseChoices: { maxHeight: 220, marginBottom: 14 },
});
