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
