/* eslint-disable react-hooks/set-state-in-effect */
import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { SectionCard } from "@/components/training/training-presentational";
import { formatTrainingDate, useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { getTrainingEvaluationApi, submitTrainingEvaluationApi } from "@/services/training.service";
import { TrainingEvaluation } from "@/types/training.model";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

export default function TrainingEvaluationFormScreen() {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const { showToast } = useToast();
  const { trainingCourseId } = useLocalSearchParams<{ trainingCourseId?: string }>();
  const [form, setForm] = useState<TrainingEvaluation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const load = useCallback(() => employeeId && trainingCourseId ? getTrainingEvaluationApi(employeeId, trainingCourseId) : Promise.resolve(null), [employeeId, trainingCourseId]);
  const { data, loading, error, reload } = useTrainingResource(load, [employeeId, trainingCourseId]);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const readOnly = !form || form.hasEvaluated || form.status !== "open" || form.isPostponed === true;
  const courseGroups = useMemo(() => form?.evaluationFormConfig.groups ?? [], [form]);
  const evaluationFieldKeys = useMemo(
    () => courseGroups.flatMap((group) => Object.keys(group.fields ?? {})),
    [courseGroups],
  );
  const hasConfiguredFields = evaluationFieldKeys.length > 0;
  const canSubmit = !!form && !readOnly && (
    hasConfiguredFields
      ? evaluationFieldKeys.every((key) => {
          const value = form.courseScores[key];
          return typeof value === "number" && value >= 1 && value <= 10;
        })
      : (form.courseScores.courseQuality ?? form.courseRating ?? 0) >= 1
  );

  const updateScore = (key: string, value: number) => setForm((current) => current ? { ...current, courseScores: { ...current.courseScores, [key]: value }, courseRating: key === "courseQuality" ? value : current.courseRating } : current);
  const updateComment = (key: string, value: string) => setForm((current) => current ? { ...current, comments: { ...current.comments, [key]: value } } : current);

  const submit = async () => {
    if (!form || !canSubmit) return;
    setSubmitting(true);
    try {
      await submitTrainingEvaluationApi(form);
      showToast("Gửi đánh giá thành công", { type: "success" });
      setForm({ ...form, hasEvaluated: true, status: "completed" });
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Gửi đánh giá thất bại", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !form) return <LoadingScreen />;
  if (!form || error) {
    return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}><AppHeader title="Đánh giá khóa học" onBack={() => router.back()} /><View style={styles.error}><Text>Không tải được biểu mẫu đánh giá.</Text><Button mode="outlined" onPress={() => void reload()}>Thử lại</Button></View></SafeAreaView>;
  }

  const statusLabel = form.isPostponed ? "Đã xin hoãn" : form.hasEvaluated ? "Đã hoàn tất" : form.status === "open" ? "Đang mở" : form.status === "completed" ? "Đã đóng" : "Chưa mở";
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <AppHeader title="Đánh giá sau đào tạo" subtitle={form.courseName} onBack={() => router.back()} actions={<Button mode="contained" compact disabled={!canSubmit} loading={submitting} onPress={() => void submit()}>Gửi</Button>} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}>
          <Card mode="outlined" style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Card.Content style={{ gap: 7 }}><View style={styles.headerLine}><Text variant="titleLarge" style={styles.title}>{form.courseName}</Text><Badge variant={form.isPostponed ? "warning" : form.hasEvaluated ? "success" : form.status === "open" ? "primary" : "default"}>{statusLabel}</Badge></View><Text style={{ color: colors.onSurfaceVariant }}>{form.className ?? "Khóa đào tạo"} · {formatTrainingDate(form.startDate)} - {formatTrainingDate(form.endDate)}</Text>{form.isPostponed ? <Text style={{ color: colors.onSurfaceVariant, lineHeight: 19 }}>Bạn đã xin hoãn khóa đào tạo nên chưa thể gửi đánh giá.</Text> : readOnly ? <Text style={{ color: colors.onSurfaceVariant, lineHeight: 19 }}>Biểu mẫu ở chế độ chỉ xem.</Text> : null}</Card.Content></Card>

          <SectionCard title="I. Đánh giá khóa học" icon="school-outline">
            {!hasConfiguredFields ? <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>Chất lượng khóa học</Text><RatingScale value={form.courseScores.courseQuality ?? form.courseRating ?? 0} disabled={readOnly} onChange={(value) => updateScore("courseQuality", value)} /></View> : null}
            {courseGroups.map((group) => <EvaluationGroup key={group.id} group={group} values={form.courseScores} disabled={readOnly} onChange={updateScore} />)}
            <CommentsSection config={form.evaluationFormConfig} values={form.comments} disabled={readOnly} onChange={updateComment} />
          </SectionCard>

          {!readOnly ? <Button mode="contained" disabled={!canSubmit} loading={submitting} onPress={() => void submit()} style={styles.submit}>Xác nhận đánh giá</Button> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RatingScale({ value, disabled, onChange }: { value: number; disabled: boolean; onChange: (value: number) => void }) {
  const { colors } = useTheme();
  return <View style={styles.ratingWrap}><View style={styles.ratingRow}>{Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => <Button key={rating} compact mode={rating === value ? "contained" : "outlined"} disabled={disabled} onPress={() => onChange(rating)} style={styles.ratingButton} labelStyle={styles.ratingLabel}>{rating}</Button>)}</View><Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>1 = Chưa đạt · 10 = Xuất sắc</Text></View>;
}

function EvaluationGroup({ group, values, disabled, onChange }: { group: TrainingEvaluation["evaluationFormConfig"]["groups"][number]; values: Record<string, number | null>; disabled: boolean; onChange: (key: string, value: number) => void }) {
  return <View style={styles.dynamicGroup}><Text variant="titleSmall" style={styles.title}>{group.label}</Text>{Object.entries(group.fields).map(([key, field]) => <View key={key} style={styles.fieldGroup}><Text style={styles.fieldLabel}>{field.label}</Text>{field.description ? <Text style={styles.hint}>{field.description}</Text> : null}{field.type === "rating" ? <RatingScale value={typeof values[key] === "number" ? Number(values[key]) : 0} disabled={disabled} onChange={(value) => onChange(key, value)} /> : <TextInput mode="outlined" label={field.label} multiline numberOfLines={3} value={values[key] == null ? "" : String(values[key])} disabled={disabled} />}</View>)}</View>;
}

function CommentsSection({ config, values, disabled, onChange }: { config: TrainingEvaluation["evaluationFormConfig"]; values: Record<string, string | null>; disabled: boolean; onChange: (key: string, value: string) => void }) {
  const comments = Object.entries(config.comments ?? {});
  if (!comments.length) return null;
  return <View style={styles.commentsSection}>{comments.map(([key, comment]) => <View key={key} style={styles.fieldGroup}><Text style={styles.fieldLabel}>{comment.label}</Text>{comment.description ? <Text style={styles.hint}>{comment.description}</Text> : null}<TextInput mode="outlined" label={comment.label} multiline numberOfLines={3} value={values[key] ?? ""} disabled={disabled} onChangeText={(value) => onChange(key, value)} style={styles.input} /></View>)}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  headerCard: { borderRadius: 20 },
  headerLine: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  title: { fontWeight: "800", flex: 1 },
  fieldGroup: { gap: 8, marginBottom: 14 },
  fieldLabel: { fontWeight: "700", lineHeight: 20 },
  input: { marginBottom: 12, backgroundColor: "transparent" },
  commentsSection: { marginTop: 6 },
  ratingWrap: { gap: 7 },
  ratingRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  ratingButton: { minWidth: 30, margin: 0 },
  ratingLabel: { marginHorizontal: 0, fontSize: 12 },
  dynamicGroup: { gap: 10, marginTop: 4, marginBottom: 10 },
  hint: { color: "#5B667A", lineHeight: 18 },
  submit: { borderRadius: 12, marginTop: 2 },
  error: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
});
