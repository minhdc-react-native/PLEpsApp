import AppHeader from "@/components/app-header";
import { Badge } from "@/components/badge";
import { Field } from "@/components/Field";
import DetailSectionHeader from "@/components/detail-section-header";
import DetailTabBar from "@/components/detail-tab-bar";
import { ListFields } from "@/components/detail-fields/list-fields";
import { TrainingEmptyState, TrainingStatusBadge } from "@/components/training/training-presentational";
import { formatTrainingDate, formatTrainingDateTime, useTrainingResource } from "@/hooks/useTraining";
import { useData } from "@/hooks/zustand/useData";
import { cancelTrainingClassApi, getMyTrainingClassesApi, getTrainingClassApi, getTrainingCourseApi, getTrainingCourseClassesApi, getTrainingExamStudentsApi, getTrainingRegistrationApi, markTrainingSessionAttendanceApi, registerTrainingClassApi, requestTrainingPostponeApi } from "@/services/training.service";
import { TrainingClass, TrainingCourse, TrainingExamSession, TrainingRegistrationRecord, TrainingStudentRegistration } from "@/types/training.model";
import { trainingHref } from "@/utils/training-navigation";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, Card, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { TabView } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/dialog/useToast";

type DetailPayload = {
  course: TrainingCourse | null;
  trainingClass: TrainingClass | null;
  registration: TrainingStudentRegistration | null;
  availableClasses: TrainingClass[];
  exams: TrainingExamSession[];
};

const detailRoutes = [
  { key: "functions", title: "Chức năng" },
  { key: "student", title: "Học viên" },
  { key: "course", title: "Khóa học" },
  { key: "registration", title: "Đăng ký" },
  { key: "result", title: "Kết quả" },
  { key: "evaluation", title: "Đánh giá" },
  { key: "sessions", title: "Ngày học" },
];

export default function TrainingClassDetailScreen() {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const user = useData((state) => state.user);
  const employeeId = user?.employeeId;
  const { showToast } = useToast();
  const { trainingCourseId } = useLocalSearchParams<{ trainingCourseId?: string }>();
  const [index, setIndex] = useState(0);
  const [processingClassId, setProcessingClassId] = useState<string | null>(null);
  const [markingSessionId, setMarkingSessionId] = useState<string | null>(null);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postponeReason, setPostponeReason] = useState("");
  const [postponing, setPostponing] = useState(false);

  const load = useCallback(async (): Promise<DetailPayload> => {
    if (!trainingCourseId || !employeeId) return { course: null, trainingClass: null, registration: null, availableClasses: [], exams: [] };
    const [course, registration, myClasses] = await Promise.all([
      getTrainingCourseApi(trainingCourseId),
      getTrainingRegistrationApi(employeeId, trainingCourseId),
      getMyTrainingClassesApi(trainingCourseId),
    ]);
    const registeredClassId = registration?.trainingClassId ?? myClasses[0]?.id ?? null;
    const courseClasses = registeredClassId || !course ? [] : await getTrainingCourseClassesApi(trainingCourseId);
    const onlineClass = course?.type === 0 ? courseClasses[0] ?? null : null;
    const trainingClass = registeredClassId ? await getTrainingClassApi(registeredClassId) : onlineClass;
    const availableClasses = trainingClass || course?.type === 0 ? [] : courseClasses;
    const exams = await getTrainingExamStudentsApi({ trainingCourseId, classId: course?.isSharedExam ? null : trainingClass?.id });
    return { course, trainingClass, registration, availableClasses, exams };
  }, [trainingCourseId, employeeId]);
  const { data, loading, error, reload } = useTrainingResource(load, [trainingCourseId, employeeId]);

  const registerClass = async (classId: string, isRegistered: boolean) => {
    if (processingClassId) return;
    setProcessingClassId(classId);
    try {
      if (isRegistered) {
        await cancelTrainingClassApi(classId);
        showToast("Đã hủy đăng ký lớp", { type: "success" });
      } else {
        await registerTrainingClassApi(classId);
        showToast("Đăng ký lớp thành công", { type: "success" });
      }
      await reload();
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Không thể cập nhật đăng ký lớp", { type: "error" });
    } finally {
      setProcessingClassId(null);
    }
  };

  const markAttendance = async (sessionId: string) => {
    if (markingSessionId) return;
    setMarkingSessionId(sessionId);
    try {
      await markTrainingSessionAttendanceApi(sessionId);
      showToast("Điểm danh thành công", { type: "success" });
      await reload();
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Điểm danh thất bại", { type: "error" });
    } finally {
      setMarkingSessionId(null);
    }
  };

  const requestPostpone = async () => {
    if (!trainingCourseId || !postponeReason.trim() || postponing) return;
    setPostponing(true);
    try {
      await requestTrainingPostponeApi(trainingCourseId, postponeReason.trim());
      setPostponeOpen(false);
      setPostponeReason("");
      showToast("Đã gửi yêu cầu xin hoãn", { type: "success" });
      await reload();
    } catch (requestError: any) {
      showToast(requestError?.message ?? "Không thể gửi yêu cầu xin hoãn", { type: "error" });
    } finally {
      setPostponing(false);
    }
  };

  if (loading && !data) return <LoadingScreen />;
  if (!data?.course || error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
        <AppHeader title="Chi tiết lớp đào tạo" subtitle="Chi tiết lớp đào tạo" onBack={() => router.back()} />
        <TrainingEmptyState title="Không tải được khóa đào tạo" description="Vui lòng thử tải lại sau ít phút." />
      </View>
    );
  }

  const { course, trainingClass, registration, availableClasses, exams } = data;
  const isOnline = course.type === 0;
  const isPostponed = registration?.isPostponed === true;
  const classRegistrationOpen = course.status === 40 && isWithinRegistrationWindow(course.classRegistrationStartDate, course.classRegistrationEndDate);
  const canChooseClass = !isPostponed && classRegistrationOpen;
  const activeIndex = Math.min(index, detailRoutes.length - 1);
  const attendanceBySession = new Map((registration?.classSessions ?? []).map((item) => [item.id, item]));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
      <AppHeader
        title={course.name}
        subtitle="Chi tiết lớp đào tạo"
        onBack={() => router.back()}
        bottom={<DetailTabBar data={detailRoutes.map((route) => ({ id: route.key, value: route.title }))} value={detailRoutes[activeIndex].key} onChange={(value) => setIndex(detailRoutes.findIndex((route) => route.key === value.id))} mode="full" />}
      />
      <TabView
        navigationState={{ index: activeIndex, routes: detailRoutes }}
        renderScene={({ route }) => {
          if (route.key === "functions") return <FunctionTab course={course} trainingClass={trainingClass} registration={registration} availableClasses={availableClasses} exams={exams} isOnline={isOnline} isPostponed={isPostponed} classRegistrationOpen={classRegistrationOpen} canChooseClass={canChooseClass} processingClassId={processingClassId} markingSessionId={markingSessionId} attendanceBySession={attendanceBySession} postponeOpen={postponeOpen} postponeReason={postponeReason} postponing={postponing} onRegisterClass={registerClass} onMarkAttendance={markAttendance} onPostpone={() => setPostponeOpen(true)} onClosePostpone={() => setPostponeOpen(false)} onPostponeReasonChange={setPostponeReason} onSubmitPostpone={() => void requestPostpone()} onOpenExam={(examId) => router.push(trainingHref(`/screen/training/exam-session?examId=${encodeURIComponent(examId)}`))} />;
          if (route.key === "student") return <StudentInfoTab user={user} registration={registration} />;
          if (route.key === "course") return <CourseInfoTab course={course} trainingClass={trainingClass} isOnline={isOnline} />;
          if (route.key === "registration") return <RegistrationInfoTab registration={registration} isOnline={isOnline} />;
          if (route.key === "result") return <ResultInfoTab registration={registration} />;
          if (route.key === "evaluation") return <EvaluationInfoTab registration={registration} course={course} />;
          return <SessionsInfoTab trainingClass={trainingClass} registration={registration} isOnline={isOnline} />;
        }}
        lazy
        renderLazyPlaceholder={() => <LoadingScreen />}
        renderTabBar={() => null}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}

function FunctionTab({ course, trainingClass, registration, availableClasses, exams, isOnline, isPostponed, classRegistrationOpen, canChooseClass, processingClassId, markingSessionId, attendanceBySession, postponeOpen, postponeReason, postponing, onRegisterClass, onMarkAttendance, onPostpone, onClosePostpone, onPostponeReasonChange, onSubmitPostpone, onOpenExam }: {
  course: TrainingCourse;
  trainingClass: TrainingClass | null;
  registration: TrainingStudentRegistration | null;
  availableClasses: TrainingClass[];
  exams: TrainingExamSession[];
  isOnline: boolean;
  isPostponed: boolean;
  classRegistrationOpen: boolean;
  canChooseClass: boolean;
  processingClassId: string | null;
  markingSessionId: string | null;
  attendanceBySession: Map<string, { isPresent: boolean | null; attendanceTime?: Date | null }>;
  postponeOpen: boolean;
  postponeReason: string;
  postponing: boolean;
  onRegisterClass: (classId: string, isRegistered: boolean) => void;
  onMarkAttendance: (sessionId: string) => void;
  onPostpone: () => void;
  onClosePostpone: () => void;
  onPostponeReasonChange: (value: string) => void;
  onSubmitPostpone: () => void;
  onOpenExam: (examId: string) => void;
}) {
  const { colors } = useTheme();
  const currentSessions = (trainingClass?.sessions ?? []).filter((session) => session.status === 1 && !isOnline);
  const canRequestPostpone = !trainingClass && course.status === 40 && !isPostponed;

  return (
    <DetailTabScreen>
      <ScrollView contentContainerStyle={styles.tabContent}>
        <DetailSectionHeader title="Tổng quan" icon="information-outline" />
        <ListFields style={styles.groupFields}>
          <Field label="Tên khóa" value={course.name} />
          <Field label="Trạng thái" value={<TrainingStatusBadge status={course.status} />} />
          {!isOnline && trainingClass?.name ? <Field label="Lớp học" value={trainingClass.name} /> : null}
        </ListFields>

        <DetailSectionHeader title="Thực hiện chức năng" icon="gesture-tap-button" />
        <ListFields style={styles.groupFields}>
          {!isOnline ? currentSessions.length ? currentSessions.map((session) => {
            const attendance = attendanceBySession.get(session.id);
            const isPresent = attendance?.isPresent === true;
            return <View key={session.id} style={styles.actionRow}><View style={styles.actionCopy}><Text style={styles.actionTitle}>{session.name}</Text><Text style={[styles.actionMeta, { color: colors.onSurfaceVariant }]}>{formatTrainingDateTime(session.startDate)}{session.endDate ? ` - ${formatTrainingDateTime(session.endDate)}` : ""}</Text></View><Button mode={isPresent ? "outlined" : "contained"} compact loading={markingSessionId === session.id} disabled={isPresent || !!markingSessionId} onPress={() => onMarkAttendance(session.id)}>{isPresent ? "Đã điểm danh" : "Điểm danh"}</Button></View>;
          }) : <Text style={[styles.muted, { color: colors.onSurfaceVariant }]}>Hiện không có buổi học đang mở điểm danh.</Text> : <Text style={[styles.muted, { color: colors.onSurfaceVariant }]}>Khóa học trực tuyến không yêu cầu điểm danh tại lớp.</Text>}
          <Divider />
          {exams.length ? exams.map((exam) => <View key={exam.examId || exam.id} style={styles.actionRow}><View style={styles.actionCopy}><Text style={styles.actionTitle}>{exam.title}</Text><Text style={[styles.actionMeta, { color: colors.onSurfaceVariant }]}>{exam.durationMinutes ? `${exam.durationMinutes} phút` : "Không giới hạn thời gian"}</Text></View><Button mode="outlined" compact onPress={() => onOpenExam(exam.examId)}>{exam.status === "not_started" ? "Làm bài" : "Mở bài thi"}</Button></View>) : <Text style={[styles.muted, { color: colors.onSurfaceVariant }]}>Chưa có bài thi được triển khai.</Text>}
        </ListFields>

        {!trainingClass && !isOnline && course.status !== 30 ? <>
          <DetailSectionHeader title="Đăng ký lớp" icon="account-group-outline" />
          <ListFields style={styles.groupFields}>
            <Text style={[styles.muted, { color: colors.onSurfaceVariant }]}>{classRegistrationOpen ? "Bạn chưa được xếp lớp. Chọn một lớp phù hợp để đăng ký." : "Thời gian đăng ký lớp chưa mở hoặc đã kết thúc."}</Text>
            {availableClasses.length ? availableClasses.map((item) => <Card key={item.id} mode="outlined" style={[styles.classOption, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}><Card.Content style={styles.optionContent}><View style={styles.actionCopy}><Text style={styles.actionTitle}>{item.name}</Text><Text style={[styles.actionMeta, { color: colors.onSurfaceVariant }]}>{item.studentCount} học viên · {item.sessionCount} buổi</Text><Text style={[styles.actionMeta, { color: colors.onSurfaceVariant }]}>{formatTrainingDate(item.startDate)} - {formatTrainingDate(item.endDate)}</Text></View><Button mode={item.isRegistered ? "outlined" : "contained"} compact loading={processingClassId === item.id} onPress={() => onRegisterClass(item.id, item.isRegistered)} disabled={!!processingClassId || !canChooseClass}>{item.isRegistered ? "Hủy" : "Đăng ký"}</Button></Card.Content></Card>) : <Text style={[styles.muted, { color: colors.onSurfaceVariant }]}>Chưa có lớp để đăng ký.</Text>}
          </ListFields>
        </> : null}

        {canRequestPostpone ? <ListFields style={styles.groupFields}><View style={styles.actionRow}><View style={styles.actionCopy}><Text style={styles.actionTitle}>Xin hoãn đào tạo</Text><Text style={[styles.actionMeta, { color: colors.onSurfaceVariant }]}>Gửi yêu cầu để đơn vị đào tạo xem xét.</Text></View><Button mode="outlined" compact onPress={onPostpone}>Xin hoãn</Button></View></ListFields> : null}
        {postponeOpen ? <Card mode="outlined" style={[styles.postponeCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}><Card.Content style={styles.postponeContent}><Text style={styles.actionTitle}>Lý do xin hoãn</Text><TextInput mode="outlined" label="Lý do" multiline numberOfLines={3} value={postponeReason} onChangeText={onPostponeReasonChange} /><View style={styles.dialogActions}><Button onPress={onClosePostpone}>Hủy</Button><Button mode="contained" loading={postponing} disabled={!postponeReason.trim() || postponing} onPress={onSubmitPostpone}>Gửi yêu cầu</Button></View></Card.Content></Card> : null}
      </ScrollView>
    </DetailTabScreen>
  );
}

function StudentInfoTab({ user, registration }: { user: any; registration: TrainingStudentRegistration | null }) {
  const certificate = registration?.certificate;
  const certificateValue = certificate ? [certificate.certificateNumber, certificate.issueDate ? `Cấp ngày ${formatTrainingDate(certificate.issueDate)}` : null].filter(Boolean).join(" · ") : "";
  return <DetailTabScreen><ScrollView contentContainerStyle={styles.readOnlyTabContent}><ListFields style={styles.groupFields}><Field label="Họ tên" value={user?.fullName ?? ""} /><Field label="Mã nhân viên" value={user?.code ?? ""} /><Field label="Phòng ban" value={user?.department?.name ?? ""} /><Field label="Tổ/Nhóm" value={user?.team?.name ?? ""} /><Field label="Chức danh" value={user?.position?.name ?? ""} /><Field label="Chuyên môn" value={user?.area?.name ?? ""} /><Field label="Chứng chỉ" value={certificateValue} /></ListFields></ScrollView></DetailTabScreen>;
}

function CourseInfoTab({ course, trainingClass, isOnline }: { course: TrainingCourse; trainingClass: TrainingClass | null; isOnline: boolean }) {
  return <DetailTabScreen><ScrollView contentContainerStyle={styles.readOnlyTabContent}><ListFields style={styles.groupFields}><Field label="Tên khóa" value={course.name} /><Field label="Danh mục khóa" value={course.courseCategoryName ?? ""} /><Field label="Hình thức" value={isOnline ? "Trực tuyến" : "Tập trung"} /><Field label="Có chứng chỉ" value={yesNo(course.hasCertificate)} /><Field label="Khóa đề xuất" value={yesNo(course.isProposal)} /><Field label="Khóa bổ sung" value={yesNo(course.isAdditional)} />{!isOnline ? <><Field label="Tên lớp" value={trainingClass?.name ?? ""} /><Field label="Ngày bắt đầu lớp" value={formatTrainingDate(trainingClass?.startDate)} /><Field label="Ngày kết thúc lớp" value={formatTrainingDate(trainingClass?.endDate)} /></> : null}<Field label="Ngày mở đánh giá" value={formatTrainingDate(course.evaluationStartDate)} /><Field label="Ngày kết thúc đánh giá" value={formatTrainingDate(course.evaluationEndDate)} /></ListFields></ScrollView></DetailTabScreen>;
}

function RegistrationInfoTab({ registration, isOnline }: { registration: TrainingStudentRegistration | null; isOnline: boolean }) {
  return <DetailTabScreen><ScrollView contentContainerStyle={styles.readOnlyTabContent}><ListFields style={styles.groupFields}><RegistrationField label="Học viên đăng ký" record={registration?.regStatus} /><RegistrationField label="Phòng ban rà soát" record={registration?.departmentRegStatus} /><RegistrationField label="Quản trị rà soát" record={registration?.adminRegStatus} /><RegistrationField label="Kết quả đăng ký" record={registration?.finalRegStatus} /></ListFields>{!isOnline ? <ListFields style={styles.groupFields}><RegistrationField label="Học viên đăng ký" record={registration?.classRegStatus} /><RegistrationField label="Phòng ban rà soát" record={registration?.classDepartmentRegStatus} /><RegistrationField label="Quản trị rà soát" record={registration?.classAdminRegStatus} /><RegistrationField label="Kết quả đăng ký" record={registration?.classFinalRegStatus} /></ListFields> : null}</ScrollView></DetailTabScreen>;
}

function RegistrationField({ label, record }: { label: string; record?: TrainingRegistrationRecord | null }) {
  const { colors } = useTheme();
  if (!record) return <Field label={label} value="" />;
  return <Field label={label} value={<View style={styles.recordValue}><Badge variant={registrationVariant(record.status)}>{registrationLabel(record.status)}</Badge>{record.reason ? <Text style={[styles.recordMeta, { color: colors.onSurfaceVariant }]}>Lý do: {record.reason}</Text> : null}{record.note ? <Text style={[styles.recordMeta, { color: colors.onSurfaceVariant }]}>Ghi chú: {record.note}</Text> : null}{record.reviewedAt ? <Text style={[styles.recordMeta, { color: colors.onSurfaceVariant }]}>Duyệt ngày {formatTrainingDate(record.reviewedAt)}</Text> : null}</View>} />;
}

function ResultInfoTab({ registration }: { registration: TrainingStudentRegistration | null }) {
  return <DetailTabScreen><ScrollView contentContainerStyle={styles.readOnlyTabContent}><ListFields style={styles.groupFields}><Field label="Điểm" value={registration?.score == null ? "" : String(registration.score)} /><Field label="Kết quả" value={registration?.result == null ? "" : <Badge variant={registration.result ? "success" : "error"}>{registration.result ? "Đạt" : "Không đạt"}</Badge>} /><Field label="Đánh giá/Ghi chú" value={registration?.resultNote ?? ""} layout="column" />{registration?.suspension?.enabled ? <><Field label="Đình chỉ" value="Có" /><Field label="Lý do đình chỉ" value={registration.suspension.reason ?? ""} /><Field label="Ngày đình chỉ" value={formatTrainingDate(registration.suspension.date)} /></> : null}</ListFields></ScrollView></DetailTabScreen>;
}

function EvaluationInfoTab({ registration, course }: { registration: TrainingStudentRegistration | null; course: TrainingCourse }) {
  const config = registration?.evaluationFormConfig ?? course.evaluationFormConfig;
  const courseGroups = (config?.groups ?? []).filter((group) => group.scope !== "instructor");
  const instructorGroups = (config?.groups ?? []).filter((group) => group.scope === "instructor");
  const hasEvaluation = !!registration?.hasEvaluated || registration?.evaluationRating != null || !!registration?.evaluationSubmittedAt || !!registration?.coursePositive || !!registration?.courseNegative || !!registration?.courseSuggestion || !!registration?.instructors?.length || courseGroups.length > 0;
  if (!hasEvaluation) return <DetailTabScreen><TrainingEmptyState icon="star-outline" title="Chưa có dữ liệu đánh giá" description="Thông tin đánh giá sẽ hiển thị sau khi bạn gửi phản hồi." /></DetailTabScreen>;
  return <DetailTabScreen><ScrollView contentContainerStyle={styles.readOnlyTabContent}><DetailSectionHeader title="Đánh giá khóa học" icon="star-check-outline" /><ListFields style={styles.groupFields}><Field label="Điểm đánh giá" value={ratingValue(registration?.evaluationRating)} /><Field label="Ngày gửi đánh giá" value={formatTrainingDate(registration?.evaluationSubmittedAt)} /><Field label="Điểm tích cực" value={registration?.coursePositive ?? ""} layout="column" /><Field label="Điểm hạn chế" value={registration?.courseNegative ?? ""} layout="column" /><Field label="Đề xuất" value={registration?.courseSuggestion ?? ""} layout="column" /></ListFields>{courseGroups.length ? <EvaluationGroups title="Tiêu chí bổ sung" groups={courseGroups} values={registration?.additional ?? {}} /> : null}{registration?.instructors?.length ? <><DetailSectionHeader title="Đánh giá giảng viên" icon="account-tie-outline" />{registration.instructors.map((instructor, index) => <ListFields key={`${instructor.instructorId}-${index}`} style={styles.groupFields}><Field label="Giảng viên" value={instructor.instructorName ?? `Giảng viên ${index + 1}`} /><Field label="Chuyên môn" value={ratingValue(instructor.expertise)} /><Field label="Phương pháp" value={ratingValue(instructor.pedagogy)} /><Field label="Nội dung" value={ratingValue(instructor.content)} /><Field label="Nhận xét" value={instructor.comment ?? ""} layout="column" />{instructorGroups.length ? <EvaluationGroups title="Tiêu chí bổ sung" groups={instructorGroups} values={instructor.additional ?? {}} /> : null}</ListFields>)}</> : null}</ScrollView></DetailTabScreen>;
}

function EvaluationGroups({ title, groups, values }: { title: string; groups: { id: string; label: string; fields: Record<string, { label: string; type: string }> }[]; values: Record<string, string | number | null> }) {
  return <><DetailSectionHeader title={title} icon="format-list-bulleted" />{groups.map((group) => <ListFields key={group.id} style={styles.groupFields}><Text style={styles.groupTitle}>{group.label}</Text>{Object.entries(group.fields ?? {}).map(([key, field]) => <Field key={key} label={field.label} value={field.type === "rating" ? ratingValue(values[key]) : String(values[key] ?? "")} layout="column" />)}</ListFields>)}</>;
}

function SessionsInfoTab({ trainingClass, registration, isOnline }: { trainingClass: TrainingClass | null; registration: TrainingStudentRegistration | null; isOnline: boolean }) {
  const { colors } = useTheme();
  const sessions = trainingClass?.sessions ?? [];
  const attendanceBySession = new Map((registration?.classSessions ?? []).map((item) => [item.id, item]));
  if (!sessions.length) return <DetailTabScreen><TrainingEmptyState icon="calendar-outline" title="Chưa có dữ liệu ngày học" /></DetailTabScreen>;
  return <DetailTabScreen><ScrollView contentContainerStyle={styles.readOnlyTabContent}>{sessions.map((session) => { const attendance = attendanceBySession.get(session.id); return <ListFields key={session.id} style={styles.groupFields}><Field label="Buổi học" value={session.name} /><Field label="Bắt đầu" value={formatTrainingDateTime(session.startDate)} /><Field label="Kết thúc" value={formatTrainingDateTime(session.endDate)} /><Field label="Trạng thái" value={<Text style={{ color: session.status === 1 ? colors.primary : colors.onSurface }}>{sessionStatusLabel(session.status)}</Text>} />{!isOnline ? <Field label="Điểm danh" value={attendance?.isPresent == null ? "Chưa điểm danh" : attendance.isPresent ? <Badge variant="success">Có mặt</Badge> : <Badge variant="error">Vắng mặt</Badge>} /> : null}{!isOnline && attendance?.attendanceTime ? <Field label="Thời gian điểm danh" value={formatTrainingDateTime(attendance.attendanceTime)} /> : null}</ListFields>; })}</ScrollView></DetailTabScreen>;
}

function DetailTabScreen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.tabScreen, { backgroundColor: colors.background }]}>{children}</View>;
}

function yesNo(value?: boolean | null) { if (value == null) return ""; return value ? "Có" : "Không"; }
function ratingValue(value?: number | string | null) { if (value == null || value === "") return ""; return <Badge variant="primary">{value}/10</Badge>; }
function registrationLabel(status: number) { return status === 1 ? "Tham gia" : status === 2 ? "Từ chối" : status === 3 ? "Bổ sung" : status === 4 ? "Hoãn" : "Chưa xác nhận"; }
function registrationVariant(status: number): "default" | "primary" | "success" | "warning" | "error" { return status === 1 ? "success" : status === 2 ? "error" : status === 3 ? "primary" : status === 4 ? "warning" : "default"; }
function sessionStatusLabel(status: number) { return status === 1 ? "Đang diễn ra" : status === 2 ? "Đã kết thúc" : "Chưa bắt đầu"; }
function isWithinRegistrationWindow(start?: Date | null, end?: Date | null) { const now = Date.now(); return (!start || now >= start.getTime()) && (!end || now <= end.getTime()); }

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabScreen: { flex: 1 },
  tabContent: { paddingBottom: 32 },
  readOnlyTabContent: { paddingTop: 12, paddingBottom: 32 },
  groupFields: { marginTop: 0, marginBottom: 12 },
  actionRow: { minHeight: 64, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0" },
  actionCopy: { flex: 1, minWidth: 0, gap: 3 },
  actionTitle: { fontSize: 15, lineHeight: 20, fontWeight: "700" },
  actionMeta: { fontSize: 12, lineHeight: 17 },
  muted: { fontSize: 14, lineHeight: 20, paddingVertical: 12 },
  classOption: { borderRadius: 14, marginTop: 10 },
  optionContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  postponeCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16 },
  postponeContent: { gap: 12 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  recordValue: { alignItems: "flex-end", gap: 4, maxWidth: "100%" },
  recordMeta: { textAlign: "right", fontSize: 12, lineHeight: 17 },
  groupTitle: { fontSize: 14, fontWeight: "700", paddingHorizontal: 12, paddingTop: 12 },
});
