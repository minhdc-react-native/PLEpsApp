import {
  HistoryOverviewCard,
  HistoryOverviewStat,
} from "@/components/history/history-overview-card";
import DetailSectionHeader from "@/components/detail-section-header";
import {
  HistoryListCard,
  HistoryListItem,
} from "@/components/history/history-list";
import { useData } from "@/hooks/zustand/useData";
import { mapEmployeeExamHistory } from "@/mappers/employee/exam-history.mapper";
import {
  EXAM_REGISTRATION_STATUS,
  EXAM_REGISTRATION_STATUS_LABELS,
} from "@/types/exam/enums/exam-registration-status.enum";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import { api } from "@/utils/epsApi";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { router } from "expo-router";

function getExamResult(item: IEmployeeExamHistory) {
  if (item.examinee.finalRegStatus?.status === EXAM_REGISTRATION_STATUS.POSTPONED) {
    return { label: "Hoãn thi", icon: "clock-outline", iconColor: "#667085", iconBackground: "#F1F4F8", resultColor: "#667085" };
  }
  if (item.examinee.isPass === true) {
    return { label: "Đạt", icon: "check-circle-outline", iconColor: "#087A52", iconBackground: "#E3F5EC", resultColor: "#087A52" };
  }
  if (item.examinee.isPass === false) {
    return { label: "Không đạt", icon: "close-circle-outline", iconColor: "#BA1A1A", iconBackground: "#FCE5E5", resultColor: "#BA1A1A" };
  }
  const registrationStatus = item.examinee.finalRegStatus?.status;
  if (registrationStatus === EXAM_REGISTRATION_STATUS.ADDED) {
    return { label: EXAM_REGISTRATION_STATUS_LABELS[registrationStatus], icon: "file-document-outline", iconColor: "#1D5FE9", iconBackground: "#E8F0FF", resultColor: "#1D5FE9" };
  }
  return { label: "Chưa có kết quả", icon: "file-document-outline", iconColor: "#667085", iconBackground: "#F1F4F8", resultColor: "#667085" };
}

export default function ExamHistoryManagement() {
  const [data, setData] = useState<IEmployeeExamHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useData((state) => state.user);
  const setItemData = useData((state) => state.setItemData);
  const { colors } = useTheme();

  const onRefresh = () => {
    api.get({
      link: `/employees/period-history/${user?.id}`,
      callBack: (res) => {
        setData(res.returnData.map((item: any) => mapEmployeeExamHistory(item)));
      },
      setLoading,
    });
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const passed = data.filter((item) => item.examinee.isPass === true).length;
  const failed = data.filter((item) => item.examinee.isPass === false).length;
  const postponed = data.filter(
    (item) => item.examinee.finalRegStatus?.status === EXAM_REGISTRATION_STATUS.POSTPONED,
  ).length;
  const stats: HistoryOverviewStat[] = [
    { label: "Đạt", value: passed, icon: "check-circle-outline", tone: "success" },
    { label: "Không đạt", value: failed, icon: "close-circle-outline", tone: "error" },
    { label: "Hoãn thi", value: postponed, icon: "clock-outline", tone: "neutral" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <HistoryOverviewCard
        title="Quá trình thi cử"
        subtitle={`Đã thi ${data.length} kỳ`}
        icon="clipboard-text-outline"
        stats={stats}
      />

      <DetailSectionHeader title="Danh sách kỳ thi" inset={false} />
      {data.length > 0 ? (
        <HistoryListCard>
          {data.map((item, index) => {
            const result = getExamResult(item);
            return (
              <HistoryListItem
                key={item.id || index}
                title={item.exam.name}
                subtitle={`Bậc thi: ${item.examinee.examRank.rank ?? "-"} / ${item.examinee.examRank.rankScale ?? "-"}`}
                icon={result.icon}
                iconColor={result.iconColor}
                iconBackgroundColor={result.iconBackground}
                result={{ label: result.label, color: result.resultColor }}
                last={index === data.length - 1}
                onPress={() => {
                  setItemData(item);
                  router.navigate("/screen/exam-detail");
                }}
              />
            );
          })}
        </HistoryListCard>
      ) : (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.onSurfaceVariant }}>Chưa có lịch sử thi cử</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  emptyState: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
  },
});
