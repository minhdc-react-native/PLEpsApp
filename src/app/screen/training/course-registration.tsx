import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { TrainingCourseCard, TrainingEmptyState } from "@/components/training/training-presentational";
import { formatTrainingDate, useTrainingResource } from "@/hooks/useTraining";
import { getTrainingCoursesApi, getMyTrainingCoursesApi, registerTrainingCourseApi, cancelTrainingCourseApi, getMyTrainingProposalsApi, proposeTrainingContentApi, deleteTrainingProposalApi } from "@/services/training.service";
import { MyTrainingCourse, TRAINING_COURSE_STATUS, TRAINING_REGISTRATION_STATUS, TrainingRegistrationRecord } from "@/types/training.model";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Dialog, IconButton, Portal, Text, TextInput, useTheme } from "react-native-paper";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingCourseRegistrationScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const { showToast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState("available");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalCourseId, setProposalCourseId] = useState("");
  const [proposalContent, setProposalContent] = useState("");
  const [proposalProcessing, setProposalProcessing] = useState(false);

  const load = useCallback(async () => {
    const [courses, registered] = await Promise.all([
      getTrainingCoursesApi(year, false),
      employeeId ? getMyTrainingCoursesApi(employeeId, year, { isDeployedCourse: false }) : Promise.resolve([]),
    ]);
    const registeredById = new Map(registered.map((item) => [item.id, item]));
    return courses.map((course): MyTrainingCourse => {
      const registeredCourse = registeredById.get(course.id);
      return {
        ...course,
        isRegistered: course.isRegistered || !!registeredCourse,
        regStatus: registeredCourse?.regStatus ?? null,
        departmentRegStatus: registeredCourse?.departmentRegStatus ?? null,
        adminRegStatus: registeredCourse?.adminRegStatus ?? null,
        finalRegStatus: registeredCourse?.finalRegStatus ?? null,
      };
    });
  }, [employeeId, year]);
  const { data: courses, loading, reload } = useTrainingResource(load, [year, employeeId]);
  const proposalLoad = useCallback(() => employeeId ? getMyTrainingProposalsApi(employeeId, year) : Promise.resolve([]), [employeeId, year]);
  const { data: proposals, loading: proposalsLoading, reload: reloadProposals } = useTrainingResource(proposalLoad, [employeeId, year]);

  const filteredCourses = useMemo(() => {
    return (courses ?? []).filter((course) => {
      return tab === "registered" ? course.isRegistered : !course.isRegistered;
    });
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
          <Chip mode={tab === "available" ? "outlined" : "flat"} onPress={() => setTab("available")} style={styles.tabChip} textStyle={tab === "available" ? styles.activeTabText : undefined}>Khóa có sẵn ({courses?.filter((item) => !item.isRegistered).length ?? 0})</Chip>
          <Chip mode={tab === "registered" ? "outlined" : "flat"} onPress={() => setTab("registered")} style={styles.tabChip} textStyle={tab === "registered" ? styles.activeTabText : undefined}>Đã đăng ký ({courses?.filter((item) => item.isRegistered).length ?? 0})</Chip>
          <Chip mode={tab === "proposals" ? "outlined" : "flat"} onPress={() => setTab("proposals")} style={styles.tabChip} textStyle={tab === "proposals" ? styles.activeTabText : undefined}>Đề xuất ({proposals?.length ?? 0})</Chip>
        </ScrollView>
        {tab === "proposals" ? <ProposalList proposals={proposals ?? []} courses={courses ?? []} loading={proposalsLoading} onCreate={() => setProposalOpen(true)} onDelete={(id) => void removeProposal(id)} /> : loading && !courses ? <LoadingScreen /> : filteredCourses.length ? filteredCourses.map((course) => {
          const registrationState = getRegistrationState(course);
          return (
            <TrainingCourseCard
              key={course.id}
              course={course}
              statusBadge={tab === "registered" ? registrationState.badge : null}
              meta={tab === "available" ? <RegistrationSchedule course={course} /> : null}
              action={
                <Button
                  mode={course.isRegistered ? "outlined" : "contained"}
                  compact
                  loading={processingId === course.id}
                  disabled={!!processingId || (course.isRegistered ? !registrationState.canCancel : course.status !== 10)}
                  onPress={() => void toggleRegistration(course.id, !!course.isRegistered)}
                >
                  {course.isRegistered ? "Hủy đăng ký" : "Đăng ký"}
                </Button>
              }
            />
          );
        }) : <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Chưa có khóa phù hợp</Text>}
      </ScrollView>
      <Portal><Dialog visible={proposalOpen} onDismiss={() => setProposalOpen(false)}><Dialog.Title>Đề xuất nội dung đào tạo</Dialog.Title><Dialog.Content><Text style={styles.dialogHint}>Chọn một danh mục đào tạo và mô tả nội dung bạn muốn đề xuất.</Text><View style={styles.courseChoices}>{(courses ?? []).slice(0, 8).map((course) => <Button key={course.id} compact mode={proposalCourseId === course.id ? "contained" : "outlined"} onPress={() => setProposalCourseId(course.id)}>{course.name}</Button>)}</View><TextInput mode="outlined" label="Nội dung đề xuất" multiline numberOfLines={5} value={proposalContent} onChangeText={setProposalContent} /></Dialog.Content><Dialog.Actions><Button onPress={() => setProposalOpen(false)}>Hủy</Button><Button loading={proposalProcessing} disabled={!proposalCourseId || !proposalContent.trim() || proposalProcessing} onPress={() => void submitProposal()}>Gửi đề xuất</Button></Dialog.Actions></Dialog></Portal>
    </View>
  );
}

function getRegistrationState(course: MyTrainingCourse) {
  const reviewSources: Array<[
    "admin" | "phòng ban",
    TrainingRegistrationRecord | null | undefined,
  ]> = [
    ["admin", course.adminRegStatus],
    ["phòng ban", course.departmentRegStatus],
  ];
  const reviewSource = reviewSources.find(([, record]) => record != null);

  if (!reviewSource) {
    return { canCancel: true, badge: null };
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
  const isClosed = course.status !== TRAINING_COURSE_STATUS.REGISTRATION || (!!end && new Date() > end);
  const label = isClosed
    ? "Đã đóng"
    : start || end
      ? `Lịch đăng ký: ${formatTrainingDate(start)} - ${formatTrainingDate(end)}`
      : "Chưa có lịch đăng ký";
  return <Text style={[styles.registrationSchedule, { color: isClosed ? colors.error : colors.onSurfaceVariant }]}>{label}</Text>;
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
  registrationSchedule: { fontSize: 12, lineHeight: 17 },
  tabScroll: { marginBottom: 10 },
  tabChips: { gap: 10, paddingVertical: 4, paddingHorizontal: 1 },
  tabChip: { flexShrink: 0 },
  activeTabText: { fontWeight: "700" },
  emptyText: { paddingVertical: 12, fontSize: 15 },
  title: { fontWeight: "800" },
  proposalList: { gap: 12 },
  proposalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  proposalCard: { borderRadius: 18 },
  proposalContent: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  dialogHint: { color: "#5B667A", lineHeight: 20, marginBottom: 12 },
  courseChoices: { gap: 8, marginBottom: 14 },
});
