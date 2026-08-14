import {
  TRAINING_COURSE_STATUS,
  TRAINING_REGISTRATION_STATUS,
  TrainingClass,
  TrainingCourse,
  TrainingEvaluation,
  TrainingEvaluationConfig,
  TrainingFile,
  TrainingInstructor,
  TrainingSession,
  TrainingSessionAttendance,
  TrainingStudentRegistration,
  MyTrainingCourse,
  TrainingExamSession,
  TrainingExamQuestion,
  TrainingExamAnswer,
  TrainingExamResult,
  TrainingProposal,
} from "@/types/training.model";

const toDate = (value: any): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const firstString = (...values: any[]) =>
  values.find((value) => typeof value === "string" && value.trim()) ?? "";

const mapRecord = (raw: any) =>
  raw
    ? {
        status: raw.status ?? TRAINING_REGISTRATION_STATUS.PENDING,
        reason: raw.reason ?? null,
        note: raw.note ?? null,
      }
    : null;

function registrationIsPostponed(...records: any[]) {
  return records.some((record) =>
    [record?.status, record?.value, record?.code].some(
      (value) => value === TRAINING_REGISTRATION_STATUS.POSTPONED || String(value).toLowerCase() === "postponed",
    ),
  );
}

export function mapTrainingFile(raw: any): TrainingFile {
  return {
    id: raw?.id ?? raw?.fileId ?? "",
    name: raw?.name ?? raw?.fileName ?? null,
    size: raw?.size ?? null,
    type: raw?.type ?? raw?.contentType ?? null,
    uploadedDate: raw?.uploadedDate ?? null,
  };
}

export function mapTrainingSession(raw: any): TrainingSession {
  const files = Array.isArray(raw?.files) ? raw.files.map(mapTrainingFile) : [];
  return {
    id: raw?.id ?? "",
    trainingCourseId:
      raw?.trainingCourseId ?? raw?.courseId ?? raw?.trainingClass?.trainingCourseId ?? "",
    trainingClassId: raw?.trainingClassId ?? raw?.classId ?? null,
    name: raw?.name ?? "Buổi học",
    description: raw?.description ?? "",
    startDate: toDate(raw?.startDate),
    endDate: toDate(raw?.endDate),
    status: raw?.status ?? 0,
    fileIds:
      raw?.fileIds ?? files.map((file: TrainingFile) => file.id).filter(Boolean),
    files,
  };
}

export function mapTrainingClass(raw: any): TrainingClass {
  const sessions = Array.isArray(raw?.sessions)
    ? raw.sessions.map(mapTrainingSession)
    : [];
  const instructors: TrainingInstructor[] = (raw?.instructors ?? raw?.employees ?? []).map(
    (instructor: any) => ({
      id: instructor?.id ?? "",
      name: firstString(instructor?.fullName, instructor?.name, instructor?.code),
      code: instructor?.code ?? instructor?.employeeCode ?? null,
      departmentName:
        instructor?.team?.department?.name ?? instructor?.department?.name ?? null,
      positionName: instructor?.position?.name ?? null,
      rankName: instructor?.rank?.name ?? null,
      imageUrl: instructor?.imageUrl ?? instructor?.avatar ?? null,
    }),
  );
  return {
    id: raw?.id ?? "",
    trainingCourseId: raw?.trainingCourseId ?? raw?.courseId ?? "",
    name: raw?.name ?? "Lớp đào tạo",
    status: raw?.status ?? 0,
    instructors,
    studentCount: raw?.totalEnrollment ?? raw?.studentCount ?? raw?.studentsCount ?? 0,
    sessionCount: raw?.sessionCount ?? raw?.sessionsCount ?? sessions.length,
    sessions,
    startDate: toDate(raw?.startDate),
    endDate: toDate(raw?.endDate),
    isRegistered: raw?.isRegistered ?? raw?.registered ?? false,
    scoreConfig: raw?.scoreConfig ?? raw?.course?.scoreConfig ?? null,
  };
}

export function mapTrainingCourse(raw: any): TrainingCourse {
  return {
    id: raw?.id ?? raw?.trainingCourseId ?? "",
    name: firstString(raw?.name, raw?.course?.name) || "Khóa đào tạo",
    description: raw?.description ?? raw?.course?.description ?? null,
    type: raw?.type ?? 1,
    status: raw?.status ?? TRAINING_COURSE_STATUS.REGISTRATION,
    year: raw?.year ?? null,
    isPlanCourse: raw?.isPlanCourse ?? false,
    isRegistered: raw?.isRegistered ?? false,
    trainingForm: raw?.trainingForm ?? null,
    organizationForm: raw?.organizationForm ?? null,
    studentCount: raw?.studentCount ?? 0,
    classCount: raw?.classCount ?? 0,
    examCount: raw?.examCount ?? 0,
    evaluationStartDate: toDate(raw?.evaluationStartDate ?? raw?.evaluationStart),
    evaluationEndDate: toDate(raw?.evaluationEndDate ?? raw?.evaluationEnd),
    evaluationFormConfig: mapEvaluationConfig(raw?.evaluationFormConfig),
    classRegistrationStartDate: toDate(raw?.classRegistrationStartDate ?? raw?.registrationStartDate),
    classRegistrationEndDate: toDate(raw?.classRegistrationEndDate ?? raw?.registrationEndDate),
    isSharedExam: raw?.isSharedExam ?? raw?.sharedExam ?? false,
  };
}

export function mapMyTrainingCourse(raw: any): MyTrainingCourse {
  const course = mapTrainingCourse(raw);
  const classRaw = raw?.class ?? raw?.registeredClass ?? raw?.trainingClass ?? null;
  const registeredClass = classRaw ? mapTrainingClass(classRaw) : null;
  return {
    ...course,
    score: raw?.score ?? raw?.registration?.score ?? null,
    registeredClassId: registeredClass?.id ?? raw?.registeredClassId ?? null,
    registeredClass,
    regStatus: mapRecord(raw?.regStatus ?? raw?.registration),
    finalRegStatus: mapRecord(raw?.finalRegStatus),
  };
}

export function mapAttendance(raw: any): TrainingSessionAttendance {
  return {
    id: raw?.id ?? raw?.sessionId ?? "",
    sessionName: raw?.sessionName ?? raw?.name ?? null,
    startDate: toDate(raw?.startDate),
    isPresent: raw?.isPresent ?? raw?.present ?? null,
    attendanceTime: toDate(raw?.attendanceTime ?? raw?.attendanceDate),
  };
}

export function mapRegistration(raw: any): TrainingStudentRegistration {
  return {
    id: raw?.id ?? raw?.registrationId ?? "",
    trainingCourseId: raw?.trainingCourseId ?? raw?.courseId ?? "",
    courseName: raw?.courseName ?? raw?.trainingCourse?.name ?? null,
    className: raw?.className ?? raw?.trainingClass?.name ?? raw?.class?.name ?? null,
    trainingClassId: raw?.trainingClassId ?? raw?.classId ?? raw?.class?.id ?? null,
    score: raw?.score ?? null,
    hasEvaluated: raw?.hasEvaluated ?? raw?.evaluation?.hasEvaluated ?? false,
    evaluationRating: raw?.evaluationRating ?? raw?.evaluation?.courseRating ?? null,
    evaluationStartDate: toDate(raw?.evaluationStartDate ?? raw?.evaluation?.startDate),
    evaluationEndDate: toDate(raw?.evaluationEndDate ?? raw?.evaluation?.endDate),
    evaluationFormConfig: mapEvaluationConfig(
      raw?.evaluationFormConfig ?? raw?.trainingCourse?.evaluationFormConfig,
    ),
    coursePositive: raw?.coursePositive ?? raw?.evaluation?.positives ?? null,
    courseNegative: raw?.courseNegative ?? raw?.evaluation?.negatives ?? null,
    courseSuggestion: raw?.courseSuggestion ?? raw?.evaluation?.improvements ?? null,
    additional: raw?.evaluationAdditional ?? raw?.additional ?? {},
    instructors: (raw?.instructors ?? raw?.evaluation?.teacherEvaluations ?? []).map(
      (item: any) => mapInstructorRating(item),
    ),
    regStatus: mapRecord(raw?.regStatus ?? raw?.registration),
    finalRegStatus: mapRecord(raw?.finalRegStatus),
    isPostponed: registrationIsPostponed(
      raw?.regStatus,
      raw?.registration,
      raw?.finalRegStatus,
      raw?.classRegStatus,
      raw?.classFinalRegStatus,
      raw?.classDepartmentRegStatus,
      raw?.classAdminRegStatus,
    ),
    classSessions: (raw?.classSessions ?? raw?.sessions ?? []).map(mapAttendance),
  };
}

function mapInstructorRating(raw: any) {
  return {
    instructorId: raw?.instructorId ?? raw?.teacherId ?? raw?.id ?? "",
    instructorName: raw?.instructorName ?? raw?.teacherName ?? raw?.name ?? null,
    departmentName: raw?.departmentName ?? null,
    positionName: raw?.positionName ?? null,
    rankName: raw?.rankName ?? null,
    expertise: raw?.expertise ?? raw?.expertiseRating ?? raw?.scores?.teacherExpertise ?? 0,
    pedagogy: raw?.pedagogy ?? raw?.pedagogyRating ?? raw?.scores?.teacherPedagogy ?? 0,
    content: raw?.content ?? raw?.contentRating ?? raw?.scores?.teacherContent ?? 0,
    comment: raw?.comment ?? "",
    additional: raw?.additional ?? {},
  };
}

export function mapEvaluationConfig(raw: any): TrainingEvaluationConfig {
  const groups = Array.isArray(raw?.groups) ? raw.groups : [];
  return {
    groups: groups.map((group: any) => ({
      id: group?.id ?? String(Math.random()),
      label: group?.label ?? group?.name ?? "Nội dung đánh giá",
      scope: group?.scope,
      fields: group?.fields ?? {},
    })),
  };
}

function getEvaluationStatus(startDate: Date | null, endDate: Date | null): TrainingEvaluation["status"] {
  const now = new Date();
  if (!startDate || now < startDate) return "not-opened";
  if (endDate && now > endDate) return "completed";
  return "open";
}

export function mapEvaluation(
  registration: TrainingStudentRegistration,
  course?: TrainingCourse | null,
  trainingClass?: TrainingClass | null,
): TrainingEvaluation {
  const startDate = course?.evaluationStartDate ?? registration.evaluationStartDate ?? null;
  const endDate = course?.evaluationEndDate ?? registration.evaluationEndDate ?? null;
  const instructors = registration.instructors?.length
    ? registration.instructors
    : (trainingClass?.instructors ?? []).map((item) => ({
        instructorId: item.id,
        instructorName: item.name,
        departmentName: item.departmentName,
        positionName: item.positionName,
        rankName: item.rankName,
        expertise: 0,
        pedagogy: 0,
        content: 0,
        comment: "",
        additional: {},
      }));
  return {
    trainingCourseId: registration.trainingCourseId,
    trainingClassId: registration.trainingClassId,
    trainingRegistrationId: registration.id,
    courseName: registration.courseName ?? course?.name ?? "Khóa đào tạo",
    className: registration.className ?? trainingClass?.name ?? null,
    status: getEvaluationStatus(startDate, endDate),
    startDate,
    endDate,
    hasEvaluated: registration.hasEvaluated,
    isPostponed: registration.isPostponed,
    courseRating: registration.evaluationRating,
    coursePositive: registration.coursePositive,
    courseNegative: registration.courseNegative,
    courseSuggestion: registration.courseSuggestion,
    additional: registration.additional ?? {},
    instructors,
    evaluationFormConfig:
      registration.evaluationFormConfig ?? course?.evaluationFormConfig ?? { groups: [] },
  };
}

export function mapTrainingProposal(raw: any): TrainingProposal {
  return {
    id: String(raw?.id ?? raw?.proposalId ?? ""),
    courseId: raw?.courseId ?? raw?.trainingCourseId ?? null,
    courseName: raw?.courseName ?? raw?.course?.name ?? raw?.name ?? null,
    content: raw?.content ?? raw?.note ?? null,
    status: raw?.status ?? null,
    statusLabel: raw?.statusLabel ?? null,
    createdAt: toDate(raw?.createdAt ?? raw?.createdDate),
  };
}

function examStatus(raw: any): TrainingExamSession["status"] {
  const value = String(raw?.status ?? raw?.examStatus ?? raw?.attempt?.status ?? "").toLowerCase();
  if (["result", "completed", "graded"].some((item) => value.includes(item))) return "result";
  if (value.includes("grading")) return "grading";
  if (["in_progress", "in-progress", "started", "doing"].some((item) => value.includes(item))) return "in_progress";
  if (["submitted", "submit"].some((item) => value.includes(item))) return "submitted";
  return "not_started";
}

function examQuestionType(raw: any): TrainingExamQuestion["type"] {
  const value = String(raw?.type ?? raw?.questionType ?? "").toLowerCase();
  return raw?.type === 1 || value.includes("essay") || value.includes("text") ? "essay" : "multiple_choice";
}

export function mapTrainingExamSession(raw: any): TrainingExamSession {
  const exam = raw?.exam ?? raw?.trainingExam ?? raw;
  const attempt = raw?.attempt ?? raw?.myAttempt ?? null;
  const questionsRaw = raw?.questions ?? exam?.questions ?? raw?.examQuestions ?? [];
  const questions = (Array.isArray(questionsRaw) ? questionsRaw : []).map((question: any, index: number) => ({
    id: String(question?.id ?? question?.questionId ?? ""),
    order: question?.order ?? question?.sortOrder ?? index + 1,
    type: examQuestionType(question),
    title: firstString(question?.title, question?.text, question?.content, question?.question) || `Câu ${index + 1}`,
    maxScore: Number(question?.maxScore ?? question?.points ?? question?.score ?? 0),
    options: (question?.options ?? question?.answers ?? []).map((option: any, optionIndex: number) => ({
      id: String(option?.id ?? option?.optionId ?? ""),
      label: option?.label ?? String.fromCharCode(65 + optionIndex),
      content: option?.content ?? option?.text ?? option?.name ?? "",
    })),
  })) as TrainingExamQuestion[];
  const answers = (raw?.answers ?? attempt?.answers ?? []).map(mapTrainingExamAnswer);
  const results = (raw?.results ?? raw?.review ?? attempt?.results ?? []).map(mapTrainingExamResult);
  const status = examStatus(raw);
  const expiresAt = raw?.expiresAt ?? attempt?.expiresAt ?? null;
  return {
    id: String(raw?.id ?? attempt?.id ?? exam?.id ?? ""),
    examId: String(raw?.examId ?? exam?.id ?? raw?.trainingExamId ?? ""),
    trainingCourseId: raw?.trainingCourseId ?? exam?.trainingCourseId ?? null,
    title: firstString(raw?.title, exam?.title, exam?.name) || "Bài thi đào tạo",
    courseName: firstString(raw?.courseName, exam?.courseName, exam?.trainingCourse?.name) || "Khóa đào tạo",
    className: raw?.className ?? exam?.className ?? null,
    status,
    stage: status === "result" || status === "submitted" ? "completed" : status,
    startsAt: raw?.startsAt ?? exam?.startsAt ?? exam?.startDate ?? null,
    endsAt: raw?.endsAt ?? exam?.endsAt ?? exam?.endDate ?? null,
    expiresAt,
    attemptId: raw?.attemptId ?? attempt?.id ?? null,
    instructions: raw?.instructions ?? exam?.instructions ?? exam?.description ?? null,
    serverTimeOffsetMs: Number(raw?.serverTimeOffsetMs ?? 0),
    lastSavedAt: raw?.lastSavedAt ?? attempt?.lastSavedAt ?? null,
    submittedAt: raw?.submittedAt ?? attempt?.submittedAt ?? null,
    totalScore: raw?.totalScore ?? exam?.totalScore ?? null,
    passingScore: raw?.passingScore ?? exam?.passingScore ?? null,
    canStart: raw?.canStart ?? status === "not_started",
    durationMinutes: Number(raw?.durationMinutes ?? exam?.durationMinutes ?? exam?.duration ?? 0),
    score: raw?.score ?? attempt?.score ?? null,
    questions,
    answers,
    results,
  };
}

export function mapTrainingExamAnswer(raw: any): TrainingExamAnswer {
  return {
    questionId: String(raw?.questionId ?? raw?.id ?? ""),
    selectedOptionId: raw?.selectedOptionId ?? raw?.optionId ?? raw?.selectedAnswerId ?? null,
    essayText: raw?.essayText ?? raw?.text ?? raw?.answerText ?? null,
    isCorrect: raw?.isCorrect ?? null,
    score: raw?.score ?? null,
  };
}

export function mapTrainingExamResult(raw: any): TrainingExamResult {
  return {
    questionId: String(raw?.questionId ?? raw?.id ?? ""),
    selectedOptionId: raw?.selectedOptionId ?? raw?.optionId ?? null,
    correctOptionId: raw?.correctOptionId ?? raw?.answerId ?? null,
    essayText: raw?.essayText ?? raw?.text ?? null,
    score: raw?.score ?? null,
    maxScore: raw?.maxScore ?? raw?.points ?? null,
    isCorrect: raw?.isCorrect ?? null,
  };
}
