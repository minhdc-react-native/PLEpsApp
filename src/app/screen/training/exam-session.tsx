/* eslint-disable react-hooks/set-state-in-effect */
import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { SectionCard, TrainingEmptyState } from "@/components/training/training-presentational";
import { formatTrainingDateTime, useTrainingResource } from "@/hooks/useTraining";
import { getTrainingExamAttemptAnswersApi, getTrainingExamAttemptCorrectAnswersApi, getTrainingExamStudentApi, saveTrainingExamAnswersApi, startTrainingExamAttemptApi } from "@/services/training.service";
import { TrainingExamAnswer, TrainingExamQuestion, TrainingExamSession } from "@/types/training.model";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, RadioButton, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingExamSessionScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { examId } = useLocalSearchParams<{ examId?: string }>();
  const [session, setSession] = useState<TrainingExamSession | null>(null);
  const [answers, setAnswers] = useState<TrainingExamAnswer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
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
    if (!examId || !effectiveSession || starting) return;
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

  const save = async () => {
    if (!effectiveSession?.attemptId || saving || readOnly) return;
    setSaving(true);
    try {
      await saveTrainingExamAnswersApi(effectiveSession.attemptId, answers);
      setSession((current) => current ? { ...current, answers, lastSavedAt: new Date().toISOString() } : current);
      showToast("Đã lưu đáp án", { type: "success" });
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Không thể lưu đáp án", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

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
    return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}><AppHeader title="Bài thi đào tạo" onBack={() => router.back()} /><View style={styles.error}><TrainingEmptyState title="Không tải được bài thi" description="Vui lòng thử tải lại sau ít phút." /><Button mode="outlined" onPress={() => void reload()}>Thử lại</Button></View></SafeAreaView>;
  }

  const statusLabel = effectiveSession.status === "not_started" ? "Chưa bắt đầu" : effectiveSession.status === "in_progress" ? "Đang làm bài" : effectiveSession.status === "grading" ? "Đang chấm" : "Đã có kết quả";
  const statusVariant = effectiveSession.status === "in_progress" ? "primary" : effectiveSession.status === "result" || effectiveSession.status === "submitted" ? "success" : "default";
  const resultByQuestion = new Map((effectiveSession.results ?? []).map((item) => [item.questionId, item]));
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <AppHeader title="Bài thi đào tạo" subtitle={effectiveSession.courseName} onBack={() => router.back()} actions={isActive ? <Button mode="contained" compact loading={saving} onPress={() => void save()}>Lưu</Button> : undefined} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
        <Card mode="outlined" style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Card.Content style={styles.heroContent}><View style={{ flex: 1, gap: 7 }}><Text variant="titleLarge" style={styles.title}>{effectiveSession.title}</Text><View style={styles.metaRow}><Badge variant={statusVariant}>{statusLabel}</Badge>{effectiveSession.durationMinutes ? <Text style={{ color: colors.onSurfaceVariant }}>{effectiveSession.durationMinutes} phút</Text> : null}</View>{effectiveSession.instructions ? <Text style={{ color: colors.onSurfaceVariant, lineHeight: 20 }}>{plainText(effectiveSession.instructions)}</Text> : null}</View></Card.Content></Card>

        {effectiveSession.status === "not_started" ? <SectionCard title="Sẵn sàng làm bài" icon="clipboard-text-outline"><Text style={styles.helper}>Khi bắt đầu, hệ thống sẽ ghi nhận lượt làm bài của bạn. Hãy chuẩn bị trước khi tiếp tục.</Text><Button mode="contained" loading={starting} disabled={starting || effectiveSession.canStart === false} onPress={() => void start()}>Bắt đầu làm bài</Button></SectionCard> : null}
        {effectiveSession.status === "grading" ? <TrainingEmptyState icon="progress-clock" title="Bài thi đang được chấm" description="Kết quả sẽ hiển thị sau khi hoàn tất chấm điểm." /> : null}
        {effectiveSession.status !== "not_started" && effectiveSession.status !== "grading" && effectiveSession.questions.length ? <>
          <View style={styles.examBar}><Text style={styles.title}>Câu {questionIndex + 1}/{effectiveSession.questions.length}</Text>{isActive ? <Badge variant={remainingSeconds != null && remainingSeconds < 60 ? "error" : "primary"}>{formatRemaining(remainingSeconds)}</Badge> : <Badge variant="default">Chỉ xem</Badge>}</View>
          {currentQuestion ? <QuestionCard question={currentQuestion} answer={answerFor(currentQuestion.id)} result={resultByQuestion.get(currentQuestion.id)} disabled={readOnly} onChange={(changes) => updateAnswer(currentQuestion, changes)} /> : null}
          <View style={styles.navigation}><Button mode="outlined" disabled={questionIndex === 0} onPress={() => setQuestionIndex((value) => value - 1)}>Câu trước</Button><Button mode="contained" disabled={questionIndex >= effectiveSession.questions.length - 1} onPress={() => setQuestionIndex((value) => value + 1)}>Câu tiếp</Button></View>
          {effectiveSession.lastSavedAt ? <Text style={[styles.saved, { color: colors.onSurfaceVariant }]}>Lưu lần cuối: {formatTrainingDateTime(effectiveSession.lastSavedAt)}</Text> : null}
        </> : null}
        {effectiveSession.status === "result" || effectiveSession.status === "submitted" ? <SectionCard title="Kết quả" icon="trophy-outline"><View style={styles.resultList}><ResultRow label="Điểm" value={effectiveSession.score == null ? "Đang cập nhật" : String(effectiveSession.score)} /><Divider /><ResultRow label="Điểm đạt" value={effectiveSession.passingScore == null ? "Chưa xác định" : String(effectiveSession.passingScore)} /></View></SectionCard> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuestionCard({ question, answer, result, disabled, onChange }: { question: TrainingExamQuestion; answer?: TrainingExamAnswer; result?: { correctOptionId?: string | null; isCorrect?: boolean | null; score?: number | null }; disabled: boolean; onChange: (changes: Partial<TrainingExamAnswer>) => void }) {
  const { colors } = useTheme();
  return <Card mode="outlined" style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Card.Content style={{ gap: 13 }}><Text variant="titleMedium" style={styles.questionTitle}>{question.order}. {plainText(question.title)}</Text>{question.type === "essay" ? <TextInput mode="outlined" label="Câu trả lời" multiline numberOfLines={7} disabled={disabled} value={answer?.essayText ?? ""} onChangeText={(value) => onChange({ essayText: value })} /> : <RadioButton.Group value={answer?.selectedOptionId ?? ""} onValueChange={(value) => onChange({ selectedOptionId: value })}>{(question.options ?? []).map((option) => <View key={option.id} style={styles.option}><RadioButton value={option.id} disabled={disabled} /><Text style={styles.optionText}>{option.label}. {plainText(option.content)}</Text></View>)}</RadioButton.Group>}{result ? <Text style={{ color: result.isCorrect === false ? colors.error : colors.primary }}>Kết quả: {result.isCorrect === false ? "Chưa đúng" : result.isCorrect === true ? "Đúng" : "Đã ghi nhận"}{result.score != null ? ` · ${result.score} điểm` : ""}</Text> : null}</Card.Content></Card>;
}

function ResultRow({ label, value }: { label: string; value: string }) { return <View style={styles.resultRow}><Text style={{ color: "#5B667A" }}>{label}</Text><Text style={styles.resultValue}>{value}</Text></View>; }
function plainText(value: unknown): string { if (typeof value === "string") return value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(); if (value == null) return ""; return String(value); }
function formatRemaining(seconds: number | null) { if (seconds == null) return "Không giới hạn"; return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`; }

const styles = StyleSheet.create({ container: { flex: 1 }, content: { padding: 16, paddingBottom: 36, gap: 14 }, heroCard: { borderRadius: 20 }, heroContent: { paddingVertical: 16 }, title: { fontWeight: "800" }, metaRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }, helper: { color: "#5B667A", lineHeight: 20, marginBottom: 14 }, examBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, questionCard: { borderRadius: 20 }, questionTitle: { fontWeight: "800", lineHeight: 24 }, option: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 }, optionText: { flex: 1, lineHeight: 21 }, navigation: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, saved: { textAlign: "center", fontSize: 12 }, resultList: { gap: 14 }, resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, resultValue: { fontWeight: "800", fontSize: 16 }, error: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 } });
