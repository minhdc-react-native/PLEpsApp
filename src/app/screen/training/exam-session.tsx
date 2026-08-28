/* eslint-disable react-hooks/set-state-in-effect */
import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import TrainingRichText, { isTrainingRichTextValue } from "@/components/training/training-rich-text";
import { SectionCard, TrainingEmptyState } from "@/components/training/training-presentational";
import { formatTrainingDateTime, useTrainingResource } from "@/hooks/useTraining";
import { getTrainingExamAttemptAnswersApi, getTrainingExamAttemptCorrectAnswersApi, getTrainingExamStudentApi, saveTrainingExamAnswersApi, startTrainingExamAttemptApi } from "@/services/training.service";
import { TrainingExamAnswer, TrainingExamQuestion, TrainingExamSession } from "@/types/training.model";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Dialog, Divider, Portal, RadioButton, Text, TextInput, useTheme } from "react-native-paper";
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
    if (!attemptId || effectiveSession?.status === "in_progress" || effectiveSession?.status === "not_started") return;
    void Promise.all([getTrainingExamAttemptAnswersApi(attemptId), getTrainingExamAttemptCorrectAnswersApi(attemptId)]).then(([reviewAnswers, results]) => {
      if (!cancelled) setSession((current) => current ? { ...current, answers: reviewAnswers, results } : current);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [effectiveSession?.attemptId, effectiveSession?.status]);

  if (loading && !effectiveSession) return <LoadingScreen />;
  if (!effectiveSession || error) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}><AppHeader title="Bài thi đào tạo" onBack={() => router.back()} /><View style={styles.error}><TrainingEmptyState title="Không tải được bài thi" description="Vui lòng thử tải lại sau ít phút." /><Button mode="outlined" onPress={() => void reload()}>Thử lại</Button></View></View>;
  }

  const resultByQuestion = new Map((effectiveSession.results ?? []).map((item) => [item.questionId, item]));
  const showNavigation = effectiveSession.status !== "not_started" && effectiveSession.status !== "grading" && Boolean(currentQuestion);
  const saveDescription = effectiveSession.lastSavedAt ? `Lưu lần cuối: ${formatTrainingDateTime(effectiveSession.lastSavedAt)}` : "Chưa lưu";
  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <AppHeader title={effectiveSession.title} subtitle={saveDescription} onBack={requestExit} actions={isActive ? <Button mode="contained" compact loading={saving} onPress={() => void save()}>Lưu</Button> : undefined} />
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.content, showNavigation && styles.contentWithFooter]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}
      >

        {effectiveSession.status === "not_started" ? <SectionCard title="Sẵn sàng làm bài" icon="clipboard-text-outline"><Text style={styles.helper}>{effectiveSession.startsAt ? "Khi bắt đầu, hệ thống sẽ ghi nhận lượt làm bài của bạn. Hãy chuẩn bị trước khi tiếp tục." : "Bài thi chưa được thiết lập thời gian bắt đầu."}</Text><Button mode="contained" loading={starting} disabled={starting || effectiveSession.canStart !== true} onPress={() => void start()}>Bắt đầu làm bài</Button></SectionCard> : null}
        {effectiveSession.status === "grading" ? <TrainingEmptyState icon="progress-clock" title="Bài thi đang được chấm" description="Kết quả sẽ hiển thị sau khi hoàn tất chấm điểm." /> : null}
        {effectiveSession.status !== "not_started" && effectiveSession.status !== "grading" && effectiveSession.questions.length ? <>
          <View style={styles.examBar}><Text style={styles.questionCounter}>Câu {questionIndex + 1}/{effectiveSession.questions.length}</Text>{isActive ? <Badge variant={remainingSeconds != null && remainingSeconds < 60 ? "error" : "primary"}>Còn lại: {formatRemaining(remainingSeconds)}</Badge> : <Badge variant="default">Chỉ xem</Badge>}</View>
          {currentQuestion ? <QuestionCard question={currentQuestion} answer={answerFor(currentQuestion.id)} result={resultByQuestion.get(currentQuestion.id)} disabled={readOnly} onEssayFocus={revealEssayAnswer} onChange={(changes) => updateAnswer(currentQuestion, changes)} /> : null}
        </> : null}
        {effectiveSession.status === "result" || effectiveSession.status === "submitted" ? <SectionCard title="Kết quả" icon="trophy-outline"><View style={styles.resultList}><ResultRow label="Điểm" value={effectiveSession.score == null ? "Đang cập nhật" : String(effectiveSession.score)} /><Divider /><ResultRow label="Điểm đạt" value={effectiveSession.passingScore == null ? "Chưa xác định" : String(effectiveSession.passingScore)} /></View></SectionCard> : null}
      </ScrollView>
      {showNavigation ? <View style={[styles.navigationBar, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant, paddingBottom: insets.bottom + 12 }]}><Button mode="outlined" icon="arrow-left" style={styles.navigationButton} disabled={questionIndex === 0} onPress={() => setQuestionIndex((value) => value - 1)}>Câu trước</Button><Button mode="contained" icon="arrow-right" style={styles.navigationButton} disabled={questionIndex >= effectiveSession.questions.length - 1} onPress={() => setQuestionIndex((value) => value + 1)}>Câu tiếp</Button></View> : null}
      <Portal><Dialog visible={exitDialogVisible} onDismiss={() => { if (!exiting) { pendingExitActionRef.current = null; setExitDialogVisible(false); } }}><Dialog.Title>Thoát bài thi?</Dialog.Title><Dialog.Content><Text>Bạn có muốn lưu đáp án trước khi thoát không?</Text></Dialog.Content><Dialog.Actions><Button disabled={exiting} onPress={() => { pendingExitActionRef.current = null; setExitDialogVisible(false); }}>Hủy</Button><Button mode="contained" loading={exiting} disabled={exiting} onPress={() => void saveAndExit()}>Lưu &amp; Thoát</Button></Dialog.Actions></Dialog></Portal>
    </KeyboardAvoidingView>
  );
}

function QuestionCard({ question, answer, result, disabled, onEssayFocus, onChange }: { question: TrainingExamQuestion; answer?: TrainingExamAnswer; result?: { correctOptionId?: string | null; isCorrect?: boolean | null; score?: number | null; explanation?: unknown; examinerComment?: unknown }; disabled: boolean; onEssayFocus?: () => void; onChange: (changes: Partial<TrainingExamAnswer>) => void }) {
  const { colors } = useTheme();
  return <Card mode="outlined" style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Card.Content style={{ gap: 13 }}>{question.title ? <View style={styles.questionHeading}>{isTrainingRichTextValue(question.title) ? <TrainingRichText value={question.title} textStyle={styles.questionTitle} /> : <Text variant="titleMedium" style={styles.questionTitle}>{question.title}</Text>}</View> : null}{question.content ? <TrainingRichText value={question.content} textStyle={styles.questionContent} /> : null}{question.type === "essay" ? <TextInput mode="outlined" label="Câu trả lời" placeholder="Nhập câu trả lời…" multiline numberOfLines={7} scrollEnabled contentStyle={styles.essayInputContent} style={styles.essayInput} disabled={disabled} value={answer?.essayText ?? ""} onFocus={onEssayFocus} onChangeText={(value) => onChange({ essayText: value })} /> : <RadioButton.Group value={answer?.selectedOptionId ?? ""} onValueChange={(value) => onChange({ selectedOptionId: value })}>{(question.options ?? []).map((option) => <View key={option.id} style={styles.option}><RadioButton value={option.id} disabled={disabled} /><View style={styles.optionContent}><Text style={styles.optionLabel}>{option.label}.</Text><TrainingRichText value={option.content ?? ""} textStyle={styles.optionText} /></View></View>)}</RadioButton.Group>}{result ? <View style={styles.resultFeedback}><Text style={{ color: result.isCorrect === false ? colors.error : colors.primary }}>Kết quả: {result.isCorrect === false ? "Chưa đúng" : result.isCorrect === true ? "Đúng" : "Đã ghi nhận"}{result.score != null ? ` · ${result.score} điểm` : ""}</Text>{result.explanation ? <TrainingRichText value={result.explanation} textStyle={{ color: colors.onSurfaceVariant }} /> : null}{result.examinerComment ? <TrainingRichText value={result.examinerComment} textStyle={{ color: colors.onSurfaceVariant }} /> : null}</View> : null}</Card.Content></Card>;
}

function ResultRow({ label, value }: { label: string; value: string }) { return <View style={styles.resultRow}><Text style={{ color: "#5B667A" }}>{label}</Text><Text style={styles.resultValue}>{value}</Text></View>; }
function formatRemaining(seconds: number | null) { if (seconds == null) return "Không giới hạn"; return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`; }

const styles = StyleSheet.create({ container: { flex: 1 }, scrollView: { flex: 1 }, content: { padding: 16, paddingBottom: 36, gap: 14 }, contentWithFooter: { paddingBottom: 24 }, questionCounter: { fontSize: 19, lineHeight: 26, fontWeight: "800" }, helper: { color: "#5B667A", lineHeight: 20, marginBottom: 14 }, examBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, questionCard: { borderRadius: 20 }, questionHeading: { flexDirection: "row", alignItems: "flex-start", gap: 6 }, questionTitle: { fontWeight: "800", lineHeight: 24 }, questionContent: { color: "#182338", fontSize: 16, lineHeight: 25 }, essayInput: { minHeight: 176 }, essayInputContent: { textAlignVertical: "top" }, option: { flexDirection: "row", alignItems: "flex-start", gap: 4, paddingVertical: 4 }, optionContent: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 4, paddingTop: 7 }, optionLabel: { fontWeight: "700", lineHeight: 21 }, optionText: { flex: 1, lineHeight: 21 }, resultFeedback: { gap: 8 }, navigationBar: { flexDirection: "row", justifyContent: "space-between", gap: 12, borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 10 }, navigationButton: { flex: 1 }, resultList: { gap: 14 }, resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, resultValue: { fontWeight: "800", fontSize: 16 }, error: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 } });
