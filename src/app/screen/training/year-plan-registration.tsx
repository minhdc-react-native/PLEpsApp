import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { TrainingCourseCard, TrainingEmptyState } from "@/components/training/training-presentational";
import { formatTrainingDate, useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import {
  cancelTrainingCourseApi,
  deleteTrainingProposalApi,
  getActiveTrainingCatalogCoursesApi,
  getMyTrainingProposalsApi,
  getMyTrainingRegistrationSummariesApi,
  getTrainingCoursesApi,
  getTrainingYearPlanApi,
  proposeTrainingContentApi,
  registerTrainingCourseApi,
} from "@/services/training.service";
import {
  MyTrainingCourse,
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
  Chip,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingYearPlanRegistrationScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const { showToast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState<"plan-courses" | "content-proposals">("plan-courses");
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalCourseId, setProposalCourseId] = useState("");
  const [proposalContent, setProposalContent] = useState("");
  const [proposalProcessing, setProposalProcessing] = useState(false);
  const [processingCourseId, setProcessingCourseId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [proposals, trainingPlan, plannedCourses, catalogCourses, registrationCourses, registrations] =
      await Promise.all([
        employeeId ? getMyTrainingProposalsApi(employeeId, year) : Promise.resolve([]),
        getTrainingYearPlanApi(year),
        getTrainingCoursesApi(year, false, null, undefined, { isPlanCourse: true }),
        getActiveTrainingCatalogCoursesApi(),
        getTrainingCoursesApi(year, false, null, undefined, {
          isPlanCourse: true,
          isEmployeeRegistrationAllowed: true,
        }),
        employeeId ? getMyTrainingRegistrationSummariesApi(employeeId, year) : Promise.resolve([]),
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
      planCourses: registrationCourses
        .filter((course) => course.approvalStatus?.toLowerCase() === "approved" && course.isEmployeeRegistrationAllowed)
        .map((course): MyTrainingCourse => {
          const registration = registrations.find((item) => item.trainingCourseId === course.id);
          return {
            ...course,
            isRegistered: !!registration,
            regStatus: registration?.regStatus ?? null,
            departmentRegStatus: registration?.departmentRegStatus ?? null,
            adminRegStatus: registration?.adminRegStatus ?? null,
            finalRegStatus: registration?.finalRegStatus ?? null,
          };
        }),
      proposalCourses: catalogCourses.filter(
        (course) => !existingCourseIds.has(course.id),
      ),
    };
  }, [employeeId, year]);
  const { data, loading, reload } = useTrainingResource(load, [employeeId, year]);
  const proposals = data?.proposals ?? [];
  const canPropose = data?.trainingPlan?.status === TRAINING_YEAR_PLAN_STATUS.REGISTRATION;

  const togglePlanCourseRegistration = async (course: MyTrainingCourse) => {
    if (!employeeId || processingCourseId) return;
    setProcessingCourseId(course.id);
    try {
      if (course.isRegistered) {
        await cancelTrainingCourseApi(course.id);
        showToast("Đã hủy đăng ký khóa học", { type: "success" });
      } else {
        await registerTrainingCourseApi(course.id);
        showToast("Đăng ký khóa học thành công", { type: "success" });
      }
      await reload();
    } catch (error: any) {
      showToast(error?.message ?? "Không thể cập nhật đăng ký", { type: "error" });
    } finally {
      setProcessingCourseId(null);
    }
  };

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
        title="Đăng ký kế hoạch năm"
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
          <Chip mode={tab === "plan-courses" ? "outlined" : "flat"} onPress={() => setTab("plan-courses")} style={styles.tabChip} textStyle={tab === "plan-courses" ? styles.activeTabText : undefined}>
            Đăng ký khóa kế hoạch ({data?.planCourses.length ?? 0})
          </Chip>
          <Chip mode={tab === "content-proposals" ? "outlined" : "flat"} onPress={() => setTab("content-proposals")} style={styles.tabChip} textStyle={tab === "content-proposals" ? styles.activeTabText : undefined}>
            Đề xuất nội dung đào tạo
          </Chip>
        </ScrollView>
        {tab === "plan-courses" ? (
          <>
            <View style={styles.planHeading}>
              <Text variant="titleMedium" style={styles.title}>Kế hoạch đào tạo năm {year}</Text>
              <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
                Thời gian đăng ký nhu cầu: {formatTrainingDate(data?.trainingPlan?.startDate)} - {formatTrainingDate(data?.trainingPlan?.endDate)}
              </Text>
              {data?.trainingPlan?.endDate ? (
                <Text style={[styles.hint, { color: getDaysRemaining(data.trainingPlan.endDate) >= 0 ? colors.primary : colors.error }]}>
                  {getDaysRemaining(data.trainingPlan.endDate) >= 0 ? `Còn ${getDaysRemaining(data.trainingPlan.endDate)} ngày` : "Đã đóng đăng ký"}
                </Text>
              ) : null}
            </View>
            {!canPropose ? (
              <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
                Kế hoạch năm hiện không ở giai đoạn đăng ký.
              </Text>
            ) : null}
            {loading && !data ? <LoadingScreen /> : data?.planCourses.length ? data.planCourses.map((course) => {
              const hasReview = course.departmentRegStatus?.status != null || course.adminRegStatus?.status != null;
              const finalLabel = getFinalRegistrationLabel(course.finalRegStatus?.status);
              return (
                <TrainingCourseCard
                  key={course.id}
                  course={course}
                  statusBadge={course.isRegistered ? <Badge variant="success">Đã đăng ký</Badge> : <Badge variant="default">Chưa đăng ký</Badge>}
                  meta={<Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>Phê duyệt: {finalLabel}</Text>}
                  action={
                    <Button
                      mode={course.isRegistered ? "outlined" : "contained"}
                      compact
                      loading={processingCourseId === course.id}
                      disabled={!canPropose || hasReview || !!processingCourseId}
                      onPress={() => void togglePlanCourseRegistration(course)}
                    >
                      {course.isRegistered ? "Hủy" : "Đăng ký"}
                    </Button>
                  }
                />
              );
            }) : (
              <TrainingEmptyState
                icon="calendar-blank-outline"
                title="Chưa có khóa kế hoạch"
                description="Các khóa được duyệt và mở đăng ký sẽ hiển thị tại đây."
              />
            )}
          </>
        ) : (
          <>
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
          </>
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

function getFinalRegistrationLabel(status?: number | null) {
  if (status == null) return "Chưa có kết quả";
  switch (status) {
    case 0: return "Chưa xác nhận";
    case 1: return "Tham gia";
    case 2: return "Từ chối";
    case 3: return "Bổ sung";
    case 4: return "Hoãn";
    case 5: return "Đã hủy";
    default: return "Chưa có kết quả";
  }
}

function getDaysRemaining(date: Date | string) {
  const end = new Date(date);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - today.getTime()) / 86_400_000);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  yearActions: { flexDirection: "row", alignItems: "center" },
  year: { fontWeight: "800", minWidth: 38, textAlign: "center" },
  tabScroll: { marginBottom: 12 },
  tabChips: { gap: 10, paddingVertical: 4, paddingHorizontal: 1 },
  tabChip: { flexShrink: 0 },
  activeTabText: { fontWeight: "700" },
  planHeading: { gap: 5, marginBottom: 14 },
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
