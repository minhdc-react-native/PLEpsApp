export const TRAINING_COURSE_TYPE = {
  ONLINE: 0,
  INSTRUCTOR: 1,
} as const;

export type TrainingCourseType =
  (typeof TRAINING_COURSE_TYPE)[keyof typeof TRAINING_COURSE_TYPE];

export const TRAINING_COURSE_STATUS = {
  REGISTRATION: 10,
  AWAITING_DEPLOYMENT: 30,
  CLASS_REGISTRATION: 40,
  IN_PROGRESS: 60,
  FINISHED: 99,
} as const;

export type TrainingCourseStatus = number;

export const TRAINING_CLASS_STATUS = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  FINISHED: 2,
} as const;

export const TRAINING_SESSION_STATUS = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
} as const;

export type TrainingSessionStatus = number;

export const TRAINING_REGISTRATION_STATUS = {
  PENDING: 0,
  SIGNED: 1,
  REJECTED: 2,
  ADDED: 3,
  POSTPONED: 4,
} as const;

export interface TrainingRegistrationRecord {
  status: number;
  reason: string | null;
  note: string | null;
}

export interface TrainingProposal {
  id: string;
  courseId?: string | null;
  courseName?: string | null;
  content?: string | null;
  status?: number | null;
  statusLabel?: string | null;
  createdAt?: Date | null;
}

export interface TrainingFile {
  id: string;
  name?: string | null;
  size?: number | null;
  type?: string | null;
  uploadedDate?: Date | string | null;
}

export interface TrainingSessionAttendance {
  id: string;
  sessionName?: string | null;
  startDate?: Date | null;
  isPresent: boolean | null;
  attendanceTime?: Date | null;
}

export interface TrainingSession {
  id: string;
  trainingCourseId: string;
  trainingClassId: string | null;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  status: TrainingSessionStatus;
  fileIds: string[];
  files: TrainingFile[];
}

export interface TrainingInstructor {
  id: string;
  name: string;
  code?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  rankName?: string | null;
  imageUrl?: string | null;
}

export interface TrainingClass {
  id: string;
  trainingCourseId: string;
  name: string;
  status: number;
  instructors: TrainingInstructor[];
  studentCount: number;
  sessionCount: number;
  sessions: TrainingSession[];
  startDate: Date | null;
  endDate: Date | null;
  isRegistered: boolean;
  scoreConfig?: TrainingScoreConfig | null;
}

export interface TrainingScoreConfig {
  maxScore?: number | null;
  passingScore?: number | null;
  bands?: { label: string; minScore: number; isPass: boolean }[];
}

export interface TrainingCourse {
  id: string;
  name: string;
  description?: string | null;
  type: TrainingCourseType;
  status: TrainingCourseStatus;
  year?: number | null;
  isPlanCourse?: boolean;
  isRegistered?: boolean;
  trainingForm?: number | null;
  organizationForm?: number | null;
  studentCount?: number;
  classCount?: number;
  examCount?: number;
  evaluationStartDate?: Date | null;
  evaluationEndDate?: Date | null;
  evaluationFormConfig?: TrainingEvaluationConfig;
  classRegistrationStartDate?: Date | null;
  classRegistrationEndDate?: Date | null;
  isSharedExam?: boolean;
}

export interface MyTrainingCourse extends TrainingCourse {
  score?: number | null;
  registeredClassId?: string | null;
  registeredClass?: TrainingClass | null;
  regStatus?: TrainingRegistrationRecord | null;
  finalRegStatus?: TrainingRegistrationRecord | null;
}

export interface TrainingStudentRegistration {
  id: string;
  trainingCourseId: string;
  courseName?: string | null;
  className?: string | null;
  trainingClassId?: string | null;
  score?: number | null;
  hasEvaluated?: boolean;
  evaluationRating?: number | null;
  evaluationStartDate?: Date | null;
  evaluationEndDate?: Date | null;
  evaluationFormConfig?: TrainingEvaluationConfig;
  coursePositive?: string | null;
  courseNegative?: string | null;
  courseSuggestion?: string | null;
  additional?: Record<string, string | number | null>;
  instructors?: TrainingSurveyInstructor[];
  regStatus?: TrainingRegistrationRecord | null;
  finalRegStatus?: TrainingRegistrationRecord | null;
  isPostponed?: boolean;
  classSessions: TrainingSessionAttendance[];
}

export interface TrainingEvaluationField {
  label: string;
  type: "rating" | "text";
  description?: string | null;
}

export interface TrainingEvaluationGroup {
  id: string;
  label: string;
  scope?: "course" | "instructor";
  fields: Record<string, TrainingEvaluationField>;
}

export interface TrainingEvaluationConfig {
  groups: TrainingEvaluationGroup[];
}

export interface TrainingSurveyInstructor {
  instructorId: string;
  instructorName?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  rankName?: string | null;
  expertise?: number;
  pedagogy?: number;
  content?: number;
  comment?: string | null;
  additional?: Record<string, string | number | null>;
}

export interface TrainingEvaluation {
  trainingCourseId: string;
  trainingClassId?: string | null;
  trainingRegistrationId?: string | null;
  courseName: string;
  className?: string | null;
  status: "not-opened" | "open" | "completed";
  startDate: Date | null;
  endDate: Date | null;
  hasEvaluated?: boolean;
  isPostponed?: boolean;
  courseRating?: number | null;
  coursePositive?: string | null;
  courseNegative?: string | null;
  courseSuggestion?: string | null;
  additional: Record<string, string | number | null>;
  instructors: TrainingSurveyInstructor[];
  evaluationFormConfig: TrainingEvaluationConfig;
}

// The web contract is intentionally represented now so the mobile route can
// be added later without changing the training domain model again.
export interface TrainingExamSession {
  id: string;
  examId: string;
  trainingCourseId?: string | null;
  title: string;
  courseName: string;
  className?: string | null;
  status: "not_started" | "in_progress" | "grading" | "result" | "submitted";
  stage: "not_started" | "in_progress" | "grading" | "completed";
  startsAt?: string | null;
  endsAt?: string | null;
  expiresAt?: string | null;
  attemptId?: string | null;
  instructions?: string | null;
  serverTimeOffsetMs?: number;
  lastSavedAt?: string | null;
  submittedAt?: string | null;
  totalScore?: number | null;
  passingScore?: number | null;
  canStart?: boolean;
  durationMinutes: number;
  score?: number | null;
  questions: TrainingExamQuestion[];
  answers?: TrainingExamAnswer[];
  results?: TrainingExamResult[];
}

export interface TrainingExamQuestion {
  id: string;
  order: number;
  type: "multiple_choice" | "essay";
  title: string;
  maxScore: number;
  options?: { id: string; label: string; content?: unknown }[];
}

export interface TrainingExamAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  essayText?: string | null;
  isCorrect?: boolean | null;
  score?: number | null;
}

export interface TrainingExamResult {
  questionId: string;
  selectedOptionId?: string | null;
  correctOptionId?: string | null;
  essayText?: string | null;
  score?: number | null;
  maxScore?: number | null;
  isCorrect?: boolean | null;
}
