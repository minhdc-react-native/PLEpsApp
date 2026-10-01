import AppHeader from "@/components/app-header";
import {
  HistoryListCard,
  HistoryListItem,
} from "@/components/history/history-list";
import { useToast } from "@/components/dialog/useToast";
import { useData } from "@/hooks/zustand/useData";
import { mapEmployeeExamHistory } from "@/mappers/employee/exam-history.mapper";
import {
  EXAM_REGISTRATION_STATUS,
  EXAM_REGISTRATION_STATUS_LABELS,
} from "@/types/exam/enums/exam-registration-status.enum";
import type { ExamRegistrationStatus } from "@/types/exam/enums/exam-registration-status.enum";
import {
  EXAMINEE_STAGE_LABELS,
  EXAMINEE_STAGES,
  EXAM_STATUS_TO_STAGE_MAPPER,
} from "@/types/exam/enums/examinee-stage.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import type { IEmployeeExam } from "@/types/exam/exam.model";
import {
  getEmployeeExamPeriodsApi,
  type EmployeeExamPeriodMenuItem,
} from "@/services/exam.service";
import { api } from "@/utils/epsApi";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

export type ExamPeriodListType = "participating" | "registration";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getRegistrationTime(endDate?: Date | null) {
  if (!endDate) {
    return { label: "Thời hạn", value: "Chưa có lịch", tone: "pending" as const };
  }

  const end = new Date(endDate);
  const today = new Date();
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const daysLeft = Math.ceil((endDay - todayDay) / DAY_IN_MS);

  return daysLeft < 0
    ? { label: "Trạng thái", value: "Đã đóng đăng ký", tone: "error" as const }
    : { label: "Còn lại", value: `${daysLeft} ngày`, tone: "success" as const };
}

function isRegistrationPhase(item: IEmployeeExam) {
  return (
    item.exam.status === EXAM_STATUS.REGISTRATION ||
    item.exam.status === EXAM_STATUS.REVIEW ||
    item.exam.status === EXAM_STATUS.APPROVED
  );
}

function isCompleted(item: IEmployeeExam) {
  return (
    item.exam.status === EXAM_STATUS.COMPLETED ||
    item.examinee.stage >= EXAMINEE_STAGES.FINISH
  );
}

function getParticipationStatus(item: IEmployeeExam) {
  const hasResult =
    item.exam.status === EXAM_STATUS.COMPLETED &&
    item.examinee.stage >= EXAMINEE_STAGES.FINISH;

  if (hasResult) {
    return { value: "Đã có kết quả", tone: "success" as const };
  }

  if (item.examinee.stage === EXAM_STATUS_TO_STAGE_MAPPER[item.exam.status]) {
    return { value: "Đang tham gia", tone: "success" as const };
  }

  return { value: "Ngừng tham gia", tone: "error" as const };
}

function getRegistrationStatusAppearance(status: ExamRegistrationStatus | null) {
  switch (status) {
    case EXAM_REGISTRATION_STATUS.SIGNED:
      return { icon: "check-circle-outline", tone: "success" as const };
    case EXAM_REGISTRATION_STATUS.POSTPONED:
      return { icon: "clock-alert-outline", tone: "error" as const };
    case EXAM_REGISTRATION_STATUS.REJECTED:
      return { icon: "close-circle-outline", tone: "error" as const };
    case EXAM_REGISTRATION_STATUS.ADDED:
      return { icon: "account-plus-outline", tone: "success" as const };
    default:
      return { icon: "dots-horizontal", tone: "pending" as const };
  }
}

function getRegistrationActionLabel(status: ExamRegistrationStatus) {
  if (status === EXAM_REGISTRATION_STATUS.SIGNED) return "Đã đăng ký";
  if (status === EXAM_REGISTRATION_STATUS.POSTPONED) return "Đã hoãn";
  return "Chưa thực hiện";
}

function getTabItems(items: EmployeeExamPeriodMenuItem[], type: ExamPeriodListType) {
  if (type === "registration") return items.filter(isRegistrationPhase);
  return items.filter(
    (item) =>
      item.exam.status !== EXAM_STATUS.DRAFT &&
      !isCompleted(item) &&
      !isRegistrationPhase(item) &&
      (item.examinee.regStatus.status === EXAM_REGISTRATION_STATUS.SIGNED ||
        item.examinee.regStatus.status === EXAM_REGISTRATION_STATUS.ADDED),
  );
}

export default function ExamPeriodListScreen({
  type,
}: {
  type: ExamPeriodListType;
}) {
  const user = useData((state) => state.user);
  const setCurrentExam = useData((state) => state.setCurrentExam);
  const setItemData = useData((state) => state.setItemData);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [items, setItems] = useState<EmployeeExamPeriodMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.employeeId) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      setItems(await getEmployeeExamPeriodsApi(user.employeeId));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openItem = async (item: EmployeeExamPeriodMenuItem) => {
    if (openingId) return;
    setOpeningId(item.exam.id);
    try {
      const response: any = await api.get({
        link: `/exams/employee/${user?.employeeId}/exam-periods/${item.exam.id}`,
        setLoading: undefined,
      });
      const exam = mapEmployeeExamHistory(response.returnData);

      if (exam.examinee.topic?.file?.id) {
        try {
          const file = await api.getFile({ fileId: exam.examinee.topic.file.id });
          exam.examinee.topic.file = file;
        } catch {
          // Keep the exam detail usable when its optional topic file is unavailable.
        }
      }

      if (isCompleted(exam)) {
        setItemData({ id: "null", active: true, ...exam });
        router.push("/screen/exam-detail");
        return;
      }

      setItemData({ id: "null", active: true, ...exam });
      setCurrentExam(exam);
      router.push(
        isRegistrationPhase(exam)
          ? "/screen/current-exam/exam-registration-form"
          : "/screen/current-exam",
      );
    } catch {
      showToast("Không thể tải thông tin kỳ thi. Vui lòng thử lại.", {
        type: "error",
      });
    } finally {
      setOpeningId(null);
    }
  };

  const tabItems = getTabItems(items, type);
  const emptyText =
    type === "participating"
      ? "Bạn chưa có kỳ thi nào đang tham gia."
      : "Không có kỳ thi nào trong giai đoạn đăng ký.";

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <AppHeader
        title={type === "participating" ? "Theo dõi kỳ thi" : "Đăng ký tham gia"}
        onBack={() => router.back()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void refresh()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {tabItems.length ? (
          <View style={styles.list}>
            {tabItems.map((item, itemIndex) => {
              const finalStatus = item.examinee.finalRegStatus?.status ?? null;
              const statusAppearance =
                type === "registration"
                  ? getRegistrationStatusAppearance(finalStatus)
                  : null;
              const statusColor =
                statusAppearance?.tone === "success"
                  ? colors.tertiary
                  : statusAppearance?.tone === "error"
                    ? colors.error
                    : colors.onSurfaceVariant;
              const statusBackgroundColor =
                statusAppearance?.tone === "success"
                  ? colors.tertiaryContainer
                  : statusAppearance?.tone === "error"
                    ? colors.errorContainer
                    : colors.surfaceVariant;
              const registrationTime =
                type === "registration"
                  ? getRegistrationTime(item.exam.registrationEndDate)
                  : null;
              const participationStatus =
                type === "participating" ? getParticipationStatus(item) : null;
              const participationColor =
                participationStatus?.tone === "success"
                  ? colors.tertiary
                  : colors.error;

              return (
                <HistoryListCard key={item.exam.id || itemIndex}>
                  <HistoryListItem
                    title={item.exam.name}
                    subtitle={
                      type === "registration"
                        ? `Bậc thi: ${item.examinee.examRank.rank ?? "-"}/${item.examinee.examRank.rankScale ?? "-"}`
                        : `${item.exam.examType.name} · Bậc thi: ${item.examinee.examRank.rank ?? "-"}/${item.examinee.examRank.rankScale ?? "-"}`
                    }
                    icon={statusAppearance?.icon ?? "trophy-outline"}
                    iconColor={statusAppearance ? statusColor : colors.primary}
                    iconBackgroundColor={
                      statusAppearance ? statusBackgroundColor : colors.primaryContainer
                    }
                    statusDetails={
                      type === "registration"
                        ? [
                            {
                              label: "Đăng ký",
                              value: getRegistrationActionLabel(
                                item.examinee.regStatus.status,
                              ),
                            },
                            {
                              label: "Phê duyệt",
                              value:
                                finalStatus === null
                                  ? "..."
                                  : EXAM_REGISTRATION_STATUS_LABELS[finalStatus],
                              valueColor: statusColor,
                            },
                            ...(registrationTime
                              ? [
                                  {
                                    label: registrationTime.label,
                                    value: registrationTime.value,
                                    valueColor:
                                      registrationTime.tone === "success"
                                        ? colors.tertiary
                                        : registrationTime.tone === "error"
                                          ? colors.error
                                          : colors.onSurfaceVariant,
                                  },
                                ]
                              : []),
                          ]
                        : participationStatus
                          ? [
                              {
                                label: "Giai đoạn",
                                value:
                                  EXAMINEE_STAGE_LABELS[item.examinee.stage] ??
                                  "Chưa xác định",
                              },
                              {
                                label: "Trạng thái",
                                value: participationStatus.value,
                                valueColor: participationColor,
                              },
                            ]
                          : undefined
                    }
                    onPress={() => void openItem(item)}
                    last
                  />
                </HistoryListCard>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={{ color: colors.onSurfaceVariant }}>{emptyText}</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 14, paddingBottom: 28 },
  list: { gap: 12 },
  emptyState: {
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
  },
});
