import { ExamRegistrationActionCard } from "@/components/exam/actions/exam-registration";
import { ExamResultActionCard } from "@/components/exam/actions/result";
import { ExamScheduleActionCard } from "@/components/exam/actions/schedule";
import { TopicRegistrationActionCard } from "@/components/exam/actions/topic-registration";
import { ExamTrainingActionCard } from "@/components/exam/actions/training";
import { useData } from "@/hooks/zustand/useData";
import { helper } from "@/hooks/useHelper";
import { EXAM_REGISTRATION_STATUS } from "@/types/exam/enums/exam-registration-status.enum";
import {
  EXAMINEE_STAGES,
  EXAM_STATUS_TO_STAGE_MAPPER,
} from "@/types/exam/enums/examinee-stage.enum";
import {
  EXAM_STATUS,
  EXAM_STATUS_LABELS,
} from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function CurrentExamOverview() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const { colors } = useTheme();
  const { displayDate } = helper();
  const accentBackground = blendColors(
    colors.primaryContainer,
    colors.background,
    0.35,
  );

  const stages = [
    EXAMINEE_STAGES.REGISTRATION,
    ...(currentExam.exam.examType.hasTopic ? [EXAMINEE_STAGES.TOPIC] : []),
    ...(currentExam.exam.examType.hasTraining ? [EXAMINEE_STAGES.EDUCATION] : []),
    EXAMINEE_STAGES.SCHEDULE,
    EXAMINEE_STAGES.RESULT,
  ];
  const participationStage = EXAM_STATUS_TO_STAGE_MAPPER[currentExam.exam.status];
  const passedStageCount =
    currentExam.examinee.stage >= EXAMINEE_STAGES.FINISH
      ? stages.length
      : stages.filter((stage) => stage < currentExam.examinee.stage).length;
  const completedStages = Math.max(
    passedStageCount,
    currentExam.examinee.regStatus.status === EXAM_REGISTRATION_STATUS.SIGNED ||
      currentExam.examinee.regStatus.status === EXAM_REGISTRATION_STATUS.ADDED
      ? 1
      : 0,
  );
  const participationStatus =
    currentExam.exam.status === EXAM_STATUS.COMPLETED &&
    currentExam.examinee.stage >= EXAMINEE_STAGES.FINISH
      ? { label: "Đã có kết quả", tone: "success" as const }
      : currentExam.examinee.stage === participationStage
        ? { label: "Đang tham gia", tone: "success" as const }
        : { label: "Ngừng tham gia", tone: "error" as const };
  const statusColor = participationStatus.tone === "success" ? "#087A52" : colors.error;
  const statusBackground = participationStatus.tone === "success" ? "#E3F5EE" : colors.errorContainer;
  const examStatusLabel = EXAM_STATUS_LABELS[currentExam.exam.status];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: accentBackground }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.summarySection}>
        <View style={styles.summaryHeading}>
          <View style={styles.summaryTitleBlock}>
            <Text
              variant="titleMedium"
              numberOfLines={2}
              style={{ color: colors.onPrimaryContainer, fontWeight: "700" }}
            >
              {currentExam.exam.name}
            </Text>
            <View style={styles.badges}>
              <Text
                style={[
                  styles.summaryStatus,
                  { color: colors.onPrimary, backgroundColor: colors.primary },
                ]}
              >
                {examStatusLabel}
              </Text>
              <Text
                style={[
                  styles.summaryStatus,
                  { color: statusColor, backgroundColor: statusBackground },
                ]}
              >
                {participationStatus.label}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.summaryDetails}>
          <SummaryDetail
            value={displayDate(currentExam.exam.eventMonth, "Chưa có lịch")}
          />
          <SummaryDetail value={currentExam.exam.examType.name} />
          <SummaryDetail
            value={`Bậc thi ${currentExam.examinee.examRank.rank ?? "-"}/${currentExam.examinee.examRank.rankScale ?? "-"}`}
          />
          {currentExam.exam.round?.name ? (
            <SummaryDetail value={currentExam.exam.round.name} />
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.progressSection,
          { backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.progressHeading}>
          <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: "700" }}>
            Tiến trình kỳ thi
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontWeight: "600" }}>
            {completedStages}/{stages.length}
          </Text>
        </View>
        <View style={styles.progressSegments}>
          {stages.map((stage, index) => (
            <View
              key={stage}
              style={[
                styles.progressSegment,
                {
                  backgroundColor:
                    index < completedStages ? colors.primary : colors.surfaceVariant,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.timeline}>
          <ExamRegistrationActionCard />
          <TopicRegistrationActionCard />
          <ExamTrainingActionCard />
          <ExamScheduleActionCard />
          <ExamResultActionCard />
        </View>
      </View>
      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

function SummaryDetail({ value }: { value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryDetail}>
      <Text style={[styles.summaryDetailText, { color: colors.onPrimaryContainer }]}>
        {value}
      </Text>
    </View>
  );
}

function blendColors(accent: string, background: string, accentRatio: number) {
  const parseColor = (value: string) => {
    const normalized = value.replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
    return [0, 2, 4].map((index) =>
      Number.parseInt(normalized.slice(index, index + 2), 16),
    );
  };
  const accentChannels = parseColor(accent);
  const backgroundChannels = parseColor(background);
  if (!accentChannels || !backgroundChannels) return accent;

  const channels = accentChannels.map((channel, index) =>
    Math.round(
      channel * accentRatio + backgroundChannels[index] * (1 - accentRatio),
    ),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 18 },
  summarySection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 16,
  },
  summaryHeading: { flexDirection: "row", alignItems: "center" },
  summaryTitleBlock: { flex: 1, alignItems: "flex-start", gap: 9 },
  badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7 },
  summaryStatus: {
    overflow: "hidden",
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 9,
    fontWeight: "600",
  },
  summaryDetails: { gap: 7, paddingLeft: 1 },
  summaryDetail: { flexDirection: "row", alignItems: "center" },
  summaryDetailText: { flex: 1, fontSize: 13, lineHeight: 19 },
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  progressHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressSegments: { flexDirection: "row", gap: 4, marginTop: 12 },
  progressSegment: { flex: 1, height: 9, borderRadius: 5 },
  timeline: { gap: 12, paddingTop: 20 },
});
