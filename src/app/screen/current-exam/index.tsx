import ExamSvg from "@/assets/images/illustrations/exam.svg";
import { ExamRegistrationActionCard } from "@/components/exam/actions/exam-registration";
import { ExamResultActionCard } from "@/components/exam/actions/result";
import { ExamScheduleActionCard } from "@/components/exam/actions/schedule";
import { TopicRegistrationActionCard } from "@/components/exam/actions/topic-registration";
import { ExamTrainingActionCard } from "@/components/exam/actions/training";
import { useData } from "@/hooks/zustand/useData";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { Icon, IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExamRegistrationScreen() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const setItemData = useData((state) => state.setItemData);
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  const totalStages = 4;
  const completedStages = Math.min(currentExam.examinee.stage, totalStages);
  const progress = completedStages / totalStages;
  const isFinished = currentExam.exam.status === EXAM_STATUS.COMPLETED;

  const openExamDetail = () => {
    setItemData({
      id: "null",
      active: true,
      ...currentExam,
    });
    router.navigate("/screen/exam-detail");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#123EAA", "#2168E9", "#317CF5"]}
        start={{ x: 0, y: 0.15 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: top + 16 }]}
      >
        <IconButton
          icon="eye-outline"
          iconColor="#FFFFFF"
          size={22}
          style={styles.detailButton}
          onPress={openExamDetail}
        />
        <View style={styles.heroCopy}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{isFinished ? "Đã kết thúc" : "Đang diễn ra"}</Text>
          </View>
          <Text style={styles.heroTitle}>{currentExam.exam.name}</Text>
        </View>
        <View style={styles.heroArt} pointerEvents="none">
          <ExamSvg width={190} height={190} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View
          style={[
            styles.progressCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={[styles.progressIcon, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="flag-checkered" size={28} color={colors.primary} />
          </View>
          <View style={styles.progressCopy}>
            <Text style={[styles.progressLabel, { color: colors.onSurfaceVariant }]}>Tiến độ kỳ thi</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {Math.round(progress * 100)}%
            </Text>
            <Text style={[styles.progressHint, { color: colors.onSurfaceVariant }]}>Đã hoàn thành {completedStages}/{totalStages} giai đoạn</Text>
          </View>
          <View style={styles.progressTrackWrap}>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
            </View>
            <Text style={[styles.progressHint, { color: colors.onSurfaceVariant }]}>Còn {Math.max(totalStages - completedStages, 0)} giai đoạn phía trước</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <ExamRegistrationActionCard />
          <TopicRegistrationActionCard />
          <ExamTrainingActionCard />
          <ExamScheduleActionCard />
          <ExamResultActionCard />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 700,
  },
  hero: {
    minHeight: 252,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    overflow: "hidden",
    position: "relative",
  },
  detailButton: {
    position: "absolute",
    right: 10,
    top: 42,
  },
  heroCopy: {
    width: "63%",
    zIndex: 1,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
  },
  liveBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  heroArt: {
    position: "absolute",
    right: -24,
    bottom: -8,
    opacity: 0.92,
  },
  content: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 28,
  },
  progressCard: {
    marginTop: -34,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 3,
    shadowColor: "#12264F",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  progressIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
  },
  progressHint: {
    fontSize: 11,
    lineHeight: 16,
  },
  progressTrackWrap: {
    flex: 1.15,
    gap: 8,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  timeline: {
    position: "relative",
    marginTop: 28,
    gap: 14,
  },
});
