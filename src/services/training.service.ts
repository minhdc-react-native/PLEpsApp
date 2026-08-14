import { mapEvaluation, mapMyTrainingCourse, mapRegistration, mapTrainingClass, mapTrainingCourse, mapTrainingSession, mapTrainingExamSession, mapTrainingExamAnswer, mapTrainingExamResult, mapTrainingProposal } from "@/mappers/training.mapper";
import { api } from "@/utils/epsApi";
import { MyTrainingCourse, TrainingClass, TrainingCourse, TrainingEvaluation, TrainingSession, TrainingStudentRegistration, TrainingExamAnswer, TrainingExamSession, TrainingProposal } from "@/types/training.model";

function unwrap<T = any>(value: any): T {
  const payload = value?.data ?? value;
  return (payload?.returnData ?? payload?.data ?? payload) as T;
}

function asArray<T = any>(value: any): T[] {
  const data = unwrap<any>(value);
  return Array.isArray(data) ? data : [];
}

export async function getTrainingCoursesApi(year: number, isDeployedCourse = false) {
  const response = await api.get({
    link: "/training-courses",
    config: { params: { year, isPlanCourse: null, isDeployedCourse } },
  });
  return asArray(response).map(mapTrainingCourse);
}

export async function getMyTrainingCoursesApi(
  employeeId: string,
  year: number,
  options: { status?: number; isDeployedCourse?: boolean; isSavedProfile?: boolean } = {},
): Promise<MyTrainingCourse[]> {
  const response = await api.get({
    link: `/training-courses/employee/${employeeId}`,
    config: {
      params: {
        year,
        isDeployedCourse: options.isDeployedCourse ?? true,
        ...(options.status == null ? {} : { status: options.status }),
        ...(options.isSavedProfile == null ? {} : { isSavedProfile: options.isSavedProfile }),
      },
    },
  });
  return asArray(response).map(mapMyTrainingCourse);
}

export async function getTrainingCourseApi(id: string): Promise<TrainingCourse | null> {
  const response = await api.get({ link: `/training-courses/${id}/deployment` });
  const data = unwrap<any>(response);
  return data ? mapTrainingCourse(data) : null;
}

export async function registerTrainingCourseApi(trainingCourseId: string) {
  return api.post({ link: "/training-registrations/register", data: { trainingCourseId } });
}

export async function cancelTrainingCourseApi(trainingCourseId: string) {
  return api.delete({ link: `/training-registrations/employee/${trainingCourseId}` });
}

export async function getTrainingRegistrationApi(
  employeeId: string,
  trainingCourseId: string,
): Promise<TrainingStudentRegistration | null> {
  const response = await api.get({
    link: `/training-registrations/employee/${employeeId}/courses/${trainingCourseId}`,
  });
  const data = unwrap<any>(response);
  return data ? mapRegistration(data) : null;
}

export async function getMyTrainingClassesApi(trainingCourseId?: string): Promise<TrainingClass[]> {
  const response = await api.get({
    link: "/classes/me",
    config: { params: { trainingCourseId } },
  });
  return asArray(response).map(mapTrainingClass);
}

export async function getTrainingCourseClassesApi(trainingCourseId: string): Promise<TrainingClass[]> {
  const response = await api.get({
    link: "/classes",
    config: { params: { trainingCourseId } },
  });
  return asArray(response).map(mapTrainingClass);
}

export async function registerTrainingClassApi(classId: string) {
  return api.post({ link: `/classes/${classId}/register` });
}

export async function cancelTrainingClassApi(classId: string) {
  return api.delete({ link: `/classes/${classId}/register` });
}

export async function requestTrainingPostponeApi(trainingCourseId: string, reason?: string | null) {
  return api.post({ link: `/training-courses/${trainingCourseId}/postpone`, data: { reason: reason ?? null } });
}

export async function getTrainingClassApi(id: string): Promise<TrainingClass | null> {
  const response = await api.get({ link: `/classes/${id}` });
  const data = unwrap<any>(response);
  if (!data) return null;
  const trainingClass = mapTrainingClass(data);
  if (trainingClass.sessions.length) return trainingClass;
  const sessions = await getTrainingSessionsApi(id);
  return { ...trainingClass, sessions, sessionCount: sessions.length };
}

export async function getTrainingSessionsApi(classId: string): Promise<TrainingSession[]> {
  const response = await api.get({
    link: "/class-sessions",
    config: { params: { classId } },
  });
  return asArray(response).map(mapTrainingSession);
}

export async function getTrainingSessionApi(id: string): Promise<TrainingSession | null> {
  const response = await api.get({ link: `/class-sessions/${id}` });
  const data = unwrap<any>(response);
  return data ? mapTrainingSession(data) : null;
}

export async function markTrainingSessionAttendanceApi(sessionId: string) {
  return api.post({
    link: `/class-sessions/${sessionId}/attendance/self`,
    config: { params: { isPresent: true } },
  });
}

export async function getTrainingEvaluationsApi(employeeId: string, year: number): Promise<TrainingEvaluation[]> {
  const registrations = await getMyTrainingRegistrationsApi(employeeId, year);
  return Promise.all(
    registrations.map(async (registration) => {
      const [course, trainingClass] = await Promise.all([
        getTrainingCourseApi(registration.trainingCourseId),
        registration.trainingClassId ? getTrainingClassApi(registration.trainingClassId) : Promise.resolve(null),
      ]);
      return mapEvaluation(registration, course, trainingClass);
    }),
  );
}

export async function getMyTrainingRegistrationsApi(employeeId: string, year: number): Promise<TrainingStudentRegistration[]> {
  const response = await api.get({
    link: `/training-registrations/employee/${employeeId}/courses`,
    config: { params: { year } },
  });
  return asArray(response).map(mapRegistration);
}

export async function getTrainingEvaluationApi(
  employeeId: string,
  trainingCourseId: string,
): Promise<TrainingEvaluation | null> {
  const registration = await getTrainingRegistrationApi(employeeId, trainingCourseId);
  if (!registration) return null;
  const [course, trainingClass] = await Promise.all([
    getTrainingCourseApi(trainingCourseId),
    registration.trainingClassId ? getTrainingClassApi(registration.trainingClassId) : Promise.resolve(null),
  ]);
  return mapEvaluation(registration, course, trainingClass);
}

export async function submitTrainingEvaluationApi(evaluation: TrainingEvaluation) {
  return api.post({
    link: `/training-courses/${evaluation.trainingCourseId}/evaluation`,
    data: {
      courseScores: { courseQuality: evaluation.courseRating ?? 0 },
      positives: evaluation.coursePositive ?? null,
      negatives: evaluation.courseNegative ?? null,
      improvements: evaluation.courseSuggestion ?? null,
      additional: evaluation.additional ?? {},
      teacherEvaluations: evaluation.instructors.map((instructor) => ({
        teacherId: instructor.instructorId,
        scores: {
          teacherExpertise: instructor.expertise ?? 0,
          teacherPedagogy: instructor.pedagogy ?? 0,
          teacherContent: instructor.content ?? 0,
        },
        comment: instructor.comment ?? null,
        additional: instructor.additional ?? {},
      })),
    },
  });
}

export async function getTrainingExamStudentApi(examId: string): Promise<TrainingExamSession | null> {
  const response = await api.get({ link: `/training-exams/${examId}` });
  const data = unwrap<any>(response);
  return data ? mapTrainingExamSession(data) : null;
}

export async function getTrainingExamStudentsApi({ trainingCourseId, classId }: { trainingCourseId: string; classId?: string | null }): Promise<TrainingExamSession[]> {
  const response = await api.get({ link: "/training-exams", config: { params: { trainingCourseId, ...(classId ? { classId } : {}) } } });
  return asArray(response).map(mapTrainingExamSession);
}

export async function startTrainingExamAttemptApi(examId: string, metadata?: Partial<TrainingExamSession>) {
  const response = await api.post({ link: `/training-exams/${examId}/start`, data: {} });
  const data = unwrap<any>(response);
  return mapTrainingExamSession({ ...metadata, ...data, examId, status: data?.status ?? "in_progress", attempt: data?.attempt ?? data });
}

export async function saveTrainingExamAnswersApi(attemptId: string, answers: TrainingExamAnswer[]) {
  return api.post({
    link: `/training-exams/attempts/${attemptId}/save`,
    data: { answers: answers.map((answer) => ({ questionId: answer.questionId, selectedOptionId: answer.selectedOptionId ?? null, essayText: answer.essayText ?? null })) },
  });
}

export async function getTrainingExamAttemptQuestionsApi(attemptId: string) {
  const response = await api.get({ link: `/training-exams/attempts/${attemptId}/questions` });
  return asArray(response).map((item) => mapTrainingExamSession({ questions: [item] }).questions[0]).filter(Boolean);
}

export async function getTrainingExamAttemptAnswersApi(attemptId: string) {
  const response = await api.get({ link: `/training-exams/attempts/${attemptId}/answers` });
  return asArray(response).map(mapTrainingExamAnswer);
}

export async function getTrainingExamAttemptCorrectAnswersApi(attemptId: string) {
  const response = await api.get({ link: `/training-exams/attempts/${attemptId}/correct-answers` });
  return asArray(response).map(mapTrainingExamResult);
}

export async function getMyTrainingProposalsApi(employeeId: string, year: number): Promise<TrainingProposal[]> {
  const response = await api.get({ link: `/training-courses/employee/${employeeId}/proposals`, config: { params: { year } } });
  return asArray(response).map(mapTrainingProposal);
}

export async function proposeTrainingContentApi({ planId, courseId, content }: { planId?: string | null; courseId: string; content?: string | null }) {
  return api.post({ link: "/training-courses/propose", data: { trainingPlanId: planId ?? "", courseId, content: content ?? null } });
}

export async function deleteTrainingProposalApi(proposalId: string) {
  return api.delete({ link: `/training-courses/propose/${proposalId}` });
}

export async function getTrainingHistoryApi(employeeId: string, year: number): Promise<MyTrainingCourse[]> {
  return getMyTrainingCoursesApi(employeeId, year, {
    status: 99,
    isSavedProfile: true,
  });
}
