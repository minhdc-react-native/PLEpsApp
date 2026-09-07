/* eslint-disable react-hooks/set-state-in-effect */
import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import TrainingRichText, { isTrainingRichTextValue } from "@/components/training/training-rich-text";
import { SectionCard, TrainingEmptyState } from "@/components/training/training-presentational";
import { formatTrainingDateTime, useTrainingResource } from "@/hooks/useTraining";
import { getTrainingExamAttemptAnswersApi, getTrainingExamAttemptCorrectAnswersApi, getTrainingExamAttemptQuestionsApi, getTrainingExamStudentApi, saveTrainingExamAnswersApi, startTrainingExamAttemptApi } from "@/services/training.service";
import { TrainingExamAnswer, TrainingExamQuestion, TrainingExamSession } from "@/types/training.model";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Dialog, Divider, Icon, Portal, RadioButton, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingExamSessionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { examId } = useLocalSearchParams<{ examId?: string }>();
  const [session, setSession] = useState<TrainingExamSession | null>(null);
  const [answers, setAnswers] = useState<TrainingExamAnswer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [overviewVisible, setOverviewVisible] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const navigation = useNavigation();
  const pendingExitActionRef = useRef<any>(null);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [allowExit, setAllowExit] = useState(false);
  const [exitAfterSave, setExitAfterSave] = useState(false);
  const load = useCallback(() => examId ? getTrainingExamStudentApi(examId) : Promise.resolve(null), [examId]);
  const { data, loading, error, reload } = useTrainingResource(load, [examId]);

  useEffect(() => {
    if (!data) return;
    setSession(data);
    setAnswers(data.answers ?? []);
    setQuestionIndex(0);
    setOverviewVisible(["not_started", "grading", "result", "submitted"].includes(data.status));
  }, [data]);

  const effectiveSession = session ?? data;
  const isActive = effectiveSession?.status === "in_progress";
  const readOnly = !isActive || remainingSeconds === 0;
  const currentQuestion = effectiveSession?.questions[questionIndex];
  const shouldGuardExit = effectiveSession?.status === "in_progress" && Boolean(effectiveSession?.attemptId);

  const revealEssayAnswer = useCallback(() => {
    const scrollToAnswer = () => scrollRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(scrollToAnswer);
    setTimeout(scrollToAnswer, 280);
  }, []);

  useEffect(() => {
    if (currentQuestion?.type !== "essay") return;
    const subscription = Keyboard.addListener("keyboardDidShow", revealEssayAnswer);
    return () => subscription.remove();
  }, [currentQuestion?.type, revealEssayAnswer]);

  usePreventRemove(shouldGuardExit && !allowExit, ({ data }) => {
    pendingExitActionRef.current = data.action;
    setExitDialogVisible(true);
  });

  useEffect(() => {
    if (!effectiveSession || !isActive) {
      setRemainingSeconds(null);
      return;
    }
    const expiresAt = effectiveSession.expiresAt ?? effectiveSession.endsAt;
    if (!expiresAt) {
      setRemainingSeconds(effectiveSession.durationMinutes > 0 ? effectiveSession.durationMinutes * 60 : null);
      return;
    }
    const update = () => {
      const offset = effectiveSession.serverTimeOffsetMs ?? 0;
      setRemainingSeconds(Math.max(0, Math.ceil((new Date(expiresAt).getTime() - (Date.now() + offset)) / 1000)));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [effectiveSession, isActive]);

  const answerFor = (questionId: string) => answers.find((item) => item.questionId === questionId);
  const updateAnswer = (question: TrainingExamQuestion, changes: Partial<TrainingExamAnswer>) => {
    setAnswers((current) => {
      const existing = current.find((item) => item.questionId === question.id);
      if (existing) return current.map((item) => item.questionId === question.id ? { ...item, ...changes } : item);
      return [...current, { questionId: question.id, selectedOptionId: null, essayText: null, ...changes }];
    });
  };

  const start = async () => {
    if (!examId || !effectiveSession || starting || effectiveSession.canStart !== true) return;
    setStarting(true);
    try {
      const started = await startTrainingExamAttemptApi(examId, effectiveSession);
      setSession({ ...effectiveSession, ...started, questions: started.questions.length ? started.questions : effectiveSession.questions, attemptId: started.attemptId ?? effectiveSession.attemptId, status: "in_progress", stage: "in_progress" });
      setAnswers(started.answers ?? []);
      setOverviewVisible(false);
      showToast("Đã bắt đầu bài thi", { type: "success" });
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Không thể bắt đầu bài thi", { type: "error" });
    } finally {
      setStarting(false);
    }
  };

  const save = async (): Promise<boolean> => {
    if (!effectiveSession?.attemptId || saving || readOnly) return false;
    setSaving(true);
    try {
      await saveTrainingExamAnswersApi(effectiveSession.attemptId, answers);
      setSession((current) => current ? { ...current, answers, lastSavedAt: new Date().toISOString() } : current);
      showToast("Đã lưu đáp án", { type: "success" });
      return true;
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Không thể lưu đáp án", { type: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const requestExit = () => {
    if (!shouldGuardExit) {
      router.back();
      return;
    }
    pendingExitActionRef.current = null;
    setExitDialogVisible(true);
  };

  const saveAndExit = async () => {
    if (exiting) return;
    setExiting(true);
    const saved = readOnly || await save();
    if (saved) {
      setExitDialogVisible(false);
      setAllowExit(true);
      setExitAfterSave(true);
    }
    setExiting(false);
  };

  useEffect(() => {
    if (!allowExit || !exitAfterSave) return;
    const action = pendingExitActionRef.current;
    pendingExitActionRef.current = null;
    setExitAfterSave(false);
    if (action) navigation.dispatch(action);
    else router.back();
  }, [allowExit, exitAfterSave, navigation]);

  useEffect(() => {
    if (remainingSeconds !== 0 || !effectiveSession?.attemptId) return;
    void saveTrainingExamAnswersApi(effectiveSession.attemptId, answers).catch(() => undefined);
  }, [remainingSeconds, effectiveSession?.attemptId, answers]);

  useEffect(() => {
    let cancelled = false;
    const attemptId = effectiveSession?.attemptId;
    if (!attemptId || effectiveSession?.status === "in_progress" || effectiveSession?.status === "not_started") {
      setReviewLoading(false);
      return;
    }
    setReviewLoading(true);
    void Promise.all([
      getTrainingExamAttemptQuestionsApi(attemptId),
      getTrainingExamAttemptAnswersApi(attemptId),
      getTrainingExamAttemptCorrectAnswersApi(attemptId),
    ]).then(([reviewQuestions, reviewAnswers, results]) => {
      if (!cancelled) {
        setAnswers(reviewAnswers);
        setSession((current) => current ? { ...current, questions: reviewQuestions.length ? reviewQuestions : current.questions, answers: reviewAnswers, results } : current);
      }
    }).catch(() => undefined).finally(() => {
      if (!cancelled) setReviewLoading(false);
    });
    return () => { cancelled = true; };
  }, [effectiveSession?.attemptId, effectiveSession?.status]);

  if (loading && !effectiveSession) return <LoadingScreen />;
  if (!effectiveSession || error) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}><AppHeader title="Bài thi đào tạo" onBack={() => router.back()} /><View style={styles.error}><TrainingEmptyState title="Không tải được bài thi" description="Vui lòng thử tải lại sau ít phút." /><Button mode="outlined" onPress={() => void reload()}>Thử lại</Button></View></View>;
  }

  const resultByQuestion = new Map((effectiveSession.results ?? []).map((item) => [item.questionId, item]));
  const isReviewStatus = effectiveSession.status === "grading" || effectiveSession.status === "result" || effectiveSession.status === "submitted";
  const showOverview = overviewVisible && (effectiveSession.status === "not_started" || isReviewStatus);
  const showNavigation = !showOverview && effectiveSession.status !== "not_started" && Boolean(currentQuestion);
  const detailDescription = isActive
    ? `Lưu lúc ${effectiveSession.lastSavedAt ? formatTrainingDateTime(effectiveSession.lastSavedAt) : "Chưa lưu"}`
    : `Nộp lúc ${effectiveSession.submittedAt ? formatTrainingDateTime(effectiveSession.submittedAt) : "Chưa nộp"}`;
  const totalScoreBadge = !showOverview && isReviewStatus && effectiveSession.score != null && effectiveSession.totalScore != null
    ? <Badge variant="success" size="large">{effectiveSession.score}/{effectiveSession.totalScore} điểm</Badge>
    : undefined;
  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {showOverview ? <AppHeader title={effectiveSession.title} subtitle="Bài thi đào tạo" onBack={requestExit} bottom={<ExamContext session={effectiveSession} />} /> : <AppHeader title={effectiveSession.title} subtitle={detailDescription} onBack={requestExit} actions={isActive ? <Button mode="contained" compact loading={saving} onPress={() => void save()}>Lưu</Button> : totalScoreBadge} bottom={<ExamContext session={effectiveSession} />} />}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.content, showNavigation && styles.contentWithFooter]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}
      >

        {showOverview ? <ExamOverview session={effectiveSession} isReview={isReviewStatus} starting={starting} reviewLoading={reviewLoading} onStart={() => void start()} onViewDetails={() => setOverviewVisible(false)} /> : null}
        {!showOverview && effectiveSession.questions.length ? <>
          <View style={styles.examBar}><Text style={styles.questionCounter}>Câu {questionIndex + 1}/{effectiveSession.questions.length}</Text>{isActive ? <Badge variant={remainingSeconds != null && remainingSeconds < 60 ? "error" : "primary"}>Còn lại: {formatRemaining(remainingSeconds)}</Badge> : <Badge variant={questionScoreVariant(currentQuestion, resultByQuestion.get(currentQuestion?.id ?? ""))}>{formatQuestionScore(currentQuestion, resultByQuestion.get(currentQuestion?.id ?? ""))}</Badge>}</View>
          {currentQuestion ? <QuestionCard question={currentQuestion} answer={answerFor(currentQuestion.id)} result={resultByQuestion.get(currentQuestion.id)} disabled={readOnly} onEssayFocus={revealEssayAnswer} onChange={(changes) => updateAnswer(currentQuestion, changes)} /> : null}
        </> : null}
      </ScrollView>
      {showNavigation ? <View style={[styles.navigationBar, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant, paddingBottom: insets.bottom + 12 }]}><Button mode="outlined" icon="arrow-left" style={styles.navigationButton} disabled={questionIndex === 0} onPress={() => setQuestionIndex((value) => value - 1)}>Câu trước</Button><Button mode="contained" icon="arrow-right" style={styles.navigationButton} disabled={questionIndex >= effectiveSession.questions.length - 1} onPress={() => setQuestionIndex((value) => value + 1)}>Câu tiếp</Button></View> : null}
      <Portal><Dialog visible={exitDialogVisible} onDismiss={() => { if (!exiting) { pendingExitActionRef.current = null; setExitDialogVisible(false); } }}><Dialog.Title>Thoát bài thi?</Dialog.Title><Dialog.Content><Text>Bạn có muốn lưu đáp án trước khi thoát không?</Text></Dialog.Content><Dialog.Actions><Button disabled={exiting} onPress={() => { pendingExitActionRef.current = null; setExitDialogVisible(false); }}>Hủy</Button><Button mode="contained" loading={exiting} disabled={exiting} onPress={() => void saveAndExit()}>Lưu &amp; Thoát</Button></Dialog.Actions></Dialog></Portal>
    </KeyboardAvoidingView>
  );
}

function ExamOverview({ session, isReview, starting, reviewLoading, onStart, onViewDetails }: { session: TrainingExamSession; isReview: boolean; starting: boolean; reviewLoading: boolean; onStart: () => void; onViewDetails: () => void }) {
  const { colors } = useTheme();
  const hasStartTime = Boolean(session.startsAt);
  const actionLabel = isReview ? "Xem lại bài làm" : session.attemptId ? "Làm bài tiếp" : "Bắt đầu làm bài";
  const instructions = normalizeExamInstructions(session.instructions);
  const canOpenReview = isReview && session.questions.length > 0 && !reviewLoading;
  const scoreValue = session.status === "result" && session.score != null
    ? `${session.score}/${session.totalScore == null ? "--" : session.totalScore}`
    : "--";

  return <>
    <Card mode="outlined" style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Card.Content style={styles.overviewContent}>
        <Badge variant={isReview ? examStatusVariant(session.status) : "primary"}>{isReview ? examStatusLabel(session.status) : "Bài thi đào tạo"}</Badge>
        <Text variant="headlineSmall" style={styles.overviewTitle}>{session.title}</Text>
        <Text style={[styles.overviewSubtitle, { color: colors.onSurfaceVariant }]}>{session.courseName}{session.className ? ` · ${session.className}` : ""}</Text>

        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <ExamStatCard icon="clock-start" label="Mở bài thi" value={formatTrainingDateTime(session.startsAt, "--")} />
            <ExamStatCard icon="clock-end" label="Đóng bài thi" value={formatTrainingDateTime(session.endsAt, "--")} />
          </View>
          <View style={styles.statRow}>
            <ExamStatCard icon="timer-outline" label="Thời lượng làm bài" value={formatExamDuration(session.durationMinutes)} />
            <ExamStatCard icon="format-list-numbered" label="Số câu / Tổng điểm" value={`${session.questions.length} câu / ${session.totalScore == null ? "--" : `${session.totalScore} điểm`}`} />
          </View>
        </View>

        <Card mode="outlined" style={[styles.statusCard, { borderColor: colors.outlineVariant }]}>
          <Card.Content style={styles.statusContent}>
            <Text variant="titleMedium" style={styles.statusTitle}>Tình trạng làm bài</Text>
            <View style={styles.statusStatRow}>
              <ExamStatValue label="Nộp bài lúc" value={formatTrainingDateTime(session.submittedAt, "--")} />
              <ExamStatValue label="Số câu đã làm" value={`${countAnsweredQuestions(session)} / ${session.questions.length}`} />
              <ExamStatValue label="Điểm số" value={scoreValue} />
            </View>
          </Card.Content>
        </Card>

        <Text style={[styles.overviewHint, { color: colors.onSurfaceVariant }]}>
          {!isReview && !hasStartTime ? "Bài thi chưa được thiết lập thời gian bắt đầu." : !isReview && session.canStart !== true ? "Bạn chưa thể bắt đầu bài thi vào lúc này." : isReview && session.status === "grading" ? "Bài thi đang được chấm. Kết quả sẽ hiển thị sau khi hoàn tất." : "Hãy kiểm tra thông tin trước khi tiếp tục."}
        </Text>
        <Button mode="contained" icon={isReview ? "eye-outline" : "play-outline"} loading={isReview ? reviewLoading : starting} disabled={starting || reviewLoading || (!isReview && session.canStart !== true) || (isReview && !canOpenReview)} onPress={isReview ? onViewDetails : onStart}>
          {actionLabel}
        </Button>
      </Card.Content>
    </Card>

    <SectionCard title="Lưu ý & Quy định thi" icon="file-document-outline" style={styles.instructionsCard}>
      {instructions ? <TrainingRichText value={instructions} textStyle={styles.instructionText} /> : <Text style={[styles.instructionText, { color: colors.onSurfaceVariant }]}>Chưa có lưu ý hoặc quy định cho bài thi này.</Text>}
    </SectionCard>
  </>;
}

function ExamContext({ session }: { session: TrainingExamSession }) {
  const { colors } = useTheme();
  return <View style={styles.examContext}><Text numberOfLines={1} ellipsizeMode="tail" style={[styles.examContextText, { color: colors.onSurfaceVariant }]}>{session.courseName}{session.className ? ` · ${session.className}` : ""}</Text></View>;
}

function ExamStatCard({ icon, label, value }: { icon: string; label: string; value: ReactNode }) {
  const { colors } = useTheme();
  return <Card mode="outlined" style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
    <Card.Content style={styles.statCardContent}>
      <View style={[styles.statIcon, { backgroundColor: colors.primaryContainer }]}><Icon source={icon} size={19} color={colors.primary} /></View>
      <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
    </Card.Content>
  </Card>;
}

function ExamStatValue({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return <View style={styles.statusStat}>
    <Text style={[styles.statusLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
    <Text style={styles.statusValue} numberOfLines={2}>{value}</Text>
  </View>;
}

function normalizeExamInstructions(value: unknown): unknown {
  if (Array.isArray(value)) {
    const lines = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    return lines.length ? lines.join("\n") : null;
  }
  if (typeof value === "string") return value.trim() ? value : null;
  return value && typeof value === "object" ? value : null;
}

function countAnsweredQuestions(session: TrainingExamSession) {
  const answers = session.answers ?? [];
  return session.questions.filter((question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    return Boolean(answer?.selectedOptionId || answer?.essayText?.trim());
  }).length;
}

function formatExamDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "--";
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} giờ ${remainder} phút` : `${hours} giờ`;
}

function examStatusLabel(status: TrainingExamSession["status"]) {
  if (status === "not_started") return "Chưa bắt đầu";
  if (status === "in_progress") return "Đang làm bài";
  if (status === "grading") return "Đang chấm";
  if (status === "result") return "Đã có kết quả";
  return "Đã nộp bài";
}

function examStatusVariant(status: TrainingExamSession["status"]): "default" | "primary" | "success" | "warning" | "error" {
  if (status === "result") return "success";
  if (status === "grading") return "warning";
  if (status === "submitted") return "primary";
  return status === "not_started" ? "default" : "primary";
}

function formatQuestionScore(question: TrainingExamQuestion | undefined, result?: { score?: number | null }) {
  const maxScore = question?.maxScore ?? "--";
  return result?.score == null ? `-- / ${maxScore}` : `${result.score} / ${maxScore}`;
}

function questionScoreVariant(question: TrainingExamQuestion | undefined, result?: { score?: number | null }): "secondary" | "success" | "warning" | "error" {
  if (result?.score == null) return "secondary";
  if (question?.maxScore && result.score === question.maxScore) return "success";
  if (result.score === 0) return "error";
  return "warning";
}

function QuestionCard({ question, answer, result, disabled, onEssayFocus, onChange }: { question: TrainingExamQuestion; answer?: TrainingExamAnswer; result?: { selectedOptionId?: string | null; correctOptionId?: string | null; isCorrect?: boolean | null; score?: number | null; explanation?: unknown; examinerComment?: unknown }; disabled: boolean; onEssayFocus?: () => void; onChange: (changes: Partial<TrainingExamAnswer>) => void }) {
  const { colors } = useTheme();
  const correctOption = result?.correctOptionId ? question.options?.find((option) => option.id === result.correctOptionId) : undefined;
  const selectedOptionId = answer?.selectedOptionId ?? result?.selectedOptionId ?? null;
  const selectedCorrectly = Boolean(correctOption && selectedOptionId === correctOption.id);
  return <Card mode="outlined" style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Card.Content style={{ gap: 13 }}>{question.title ? <View style={styles.questionHeading}>{isTrainingRichTextValue(question.title) ? <TrainingRichText value={question.title} textStyle={styles.questionTitle} /> : <Text variant="titleMedium" style={styles.questionTitle}>{question.title}</Text>}</View> : null}{question.content ? <TrainingRichText value={question.content} textStyle={styles.questionContent} /> : null}{question.type === "essay" ? <TextInput mode="outlined" label="Câu trả lời" placeholder="Nhập câu trả lời…" multiline numberOfLines={7} scrollEnabled contentStyle={styles.essayInputContent} style={styles.essayInput} disabled={disabled} value={answer?.essayText ?? ""} onFocus={onEssayFocus} onChangeText={(value) => onChange({ essayText: value })} /> : <RadioButton.Group value={selectedOptionId ?? ""} onValueChange={(value) => onChange({ selectedOptionId: value })}>{(question.options ?? []).map((option) => <View key={option.id} style={styles.option}><RadioButton value={option.id} disabled={disabled} /><View style={styles.optionContent}><Text style={styles.optionLabel}>{option.label}.</Text><TrainingRichText value={option.content ?? ""} textStyle={styles.optionText} /></View></View>)}</RadioButton.Group>}{correctOption ? <Text style={[styles.correctAnswer, { color: selectedCorrectly ? "#176B3A" : colors.error }]}>Đáp án đúng: {correctOption.label}</Text> : null}{result?.examinerComment ? <><Divider style={styles.examinerDivider} /><View style={styles.resultFeedback}><Icon source="comment-text-outline" size={19} color={colors.primary} /><View style={styles.examinerCopy}><Text style={[styles.feedbackLabel, { color: colors.onSurfaceVariant }]}>Nhận xét giám khảo</Text><TrainingRichText value={result.examinerComment} textStyle={{ color: colors.onSurfaceVariant }} /></View></View></> : null}</Card.Content></Card>;
}

function formatRemaining(seconds: number | null) { if (seconds == null) return "Không giới hạn"; return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`; }

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 36, gap: 14 },
  contentWithFooter: { paddingBottom: 24 },
  questionCounter: { fontSize: 19, lineHeight: 26, fontWeight: "800" },
  helper: { color: "#5B667A", lineHeight: 20, marginBottom: 14 },
  examBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  overviewCard: { borderRadius: 20 },
  overviewContent: { gap: 12 },
  overviewTitle: { fontWeight: "800", lineHeight: 30 },
  overviewSubtitle: { fontSize: 15, lineHeight: 21 },
  examContext: { paddingHorizontal: 64, paddingBottom: 8 },
  examContextText: { fontSize: 12, lineHeight: 17 },
  statGrid: { gap: 10, marginTop: 4 },
  statRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 16 },
  statCardContent: { minHeight: 106, padding: 12, gap: 6 },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statLabel: { fontSize: 12, lineHeight: 16 },
  statValue: { fontSize: 15, lineHeight: 20, fontWeight: "800" },
  statusCard: { borderRadius: 16, marginTop: 2 },
  statusContent: { gap: 14 },
  statusTitle: { fontWeight: "800", flex: 1 },
  statusStatRow: { flexDirection: "row", gap: 12 },
  statusStat: { flex: 1, gap: 4 },
  statusLabel: { fontSize: 11, lineHeight: 15 },
  statusValue: { fontSize: 14, lineHeight: 19, fontWeight: "700" },
  overviewHint: { fontSize: 13, lineHeight: 19 },
  instructionsCard: { marginBottom: 0 },
  instructionText: { fontSize: 14, lineHeight: 21 },
  questionCard: { borderRadius: 20 },
  questionHeading: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  questionTitle: { fontWeight: "800", lineHeight: 24 },
  questionContent: { color: "#182338", fontSize: 16, lineHeight: 25 },
  essayInput: { minHeight: 176 },
  essayInputContent: { textAlignVertical: "top" },
  option: { flexDirection: "row", alignItems: "flex-start", gap: 4, paddingVertical: 4 },
  optionContent: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 4, paddingTop: 7 },
  optionLabel: { fontWeight: "700", lineHeight: 21 },
  optionText: { flex: 1, lineHeight: 21 },
  resultFeedback: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  examinerCopy: { flex: 1, gap: 4 },
  examinerDivider: { marginVertical: 2 },
  feedbackLabel: { fontWeight: "800", fontSize: 13 },
  correctAnswer: { fontWeight: "700", lineHeight: 21 },
  navigationBar: { flexDirection: "row", justifyContent: "space-between", gap: 12, borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 10 },
  navigationButton: { flex: 1 },
  error: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
});
