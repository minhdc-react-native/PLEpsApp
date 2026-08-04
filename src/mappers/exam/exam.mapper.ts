import { IEmployee } from "@/types/employee/employee.model";
import { HighestEducationLevel } from "@/types/employee/enums/highest-education-level.enum";
import { ExamRegistrationStatus } from "@/types/exam/enums/exam-registration-status.enum";
import { ExamStatus } from "@/types/exam/enums/exam-status.enum";
import { ExamineeStage } from "@/types/exam/enums/examinee-stage.enum";
import { ExamineeTakenExamStatus } from "@/types/exam/enums/taken-exam-status.enum";
import {
  IExam,
  IExaminee,
  IExamineeAttempt,
  IExamRound,
  IExamScore,
  IExamSubjectSchedule,
} from "@/types/exam/exam.model";
import {
  ExamineeConditionCode,
  IExamineeCondition,
  IExamineeConditionGroup,
} from "@/types/exam/examinee-condition.model";
import { IRank } from "@/types/system/rank.model";
import { mapAreaShort } from "../area.mapper";
import { mapDepartmentShort } from "../department.mapper";
import { mapPositionShort } from "../position.mapper";
import { mapTeamShort } from "../team.mapper";
import {
  mapExamScoreConfig,
  mapExamType,
  mapExamTypeVersion,
} from "./exam-type.mapper";
import { mapExamineeTopic } from "./topic.mapper";

// Map GetExamRawSchema to IExamGeneralInfo
export function mapExam(schema: any): IExam {
  const examType = mapExamType(schema.examType);
  const examTypeVersion = schema.examTypeVersion
    ? mapExamTypeVersion(schema.examTypeVersion)
    : examType.versions.find(
        (version) => version.id === String(schema.examTypeVersionId)
      ) ?? null;

  return {
    id: schema.id,
    name: schema.name,
    examType,
    examTypeVersionId: schema.examTypeVersionId ?? null,
    examTypeVersion,
    scoreConfig: mapExamScoreConfig(schema.scoreConfig),
    round: schema.examRound ? mapExamRound(schema.examRound) : null,
    eventMonth: schema.examMonth,
    status: schema.status as ExamStatus,
    registrationStartDate: schema.registrationStartDate,
    registrationEndDate: schema.registrationEndDate,
    topicSchedule: {
      startDate: schema.registrationTopicStartDate ?? null,
      endDate: schema.registrationTopicEndDate ?? null,
    },
    regApproval: {},
    decision: {},
  };
}

export function mapExamRound(schema: any): IExamRound {
  return {
    id: schema.id,
    round: schema.round,
    name: schema.name,
    eventMonth: schema.examMonth,
  };
}

export function mapExamineeEmployee(schema: any): Partial<IEmployee> {
  const department = mapDepartmentShort(schema.department);
  const team = mapTeamShort(schema.team);
  const position = mapPositionShort(schema.position);
  const area = mapAreaShort(schema.area);

  return {
    id: schema.id,
    imageUrl: schema.imageUrl,
    fullName: schema.fullName,
    code: schema.code,
    rank: {
      rank: schema.currentRank,
      rankScale: schema.rankScale,
    },
    department: department,
    team: team,
    position: position,
    area: area,
    educationInfo: {
      generalEducationLevel: null,
      highestEducationLevel:
        schema.highestAcademicLevel as HighestEducationLevel,
      highestDegree: null,
      trainingField: null,
      trainingMode: null,
      trainingInstitution: null,
      politicalTheoryLevel: null,
    },
  };
}

export function mapExamineeAttempt({
  schema,
  currentRank,
}: {
  schema: any;
  currentRank: Partial<IRank>;
}): IExamineeAttempt {
  const conditions = schema.conditions
    ? mapExamineeCondition({
        schema: schema.conditions,
        currentRank,
      })
    : null;

  return {
    conditionDate: schema.conditionMonth,
    examRank: {
      rank: schema.examRank,
      rankScale: schema.examRankScale,
    },
    salaryPeriod: schema.salaryPeriod,
    salaryYear: schema.salaryYear,
    retake: schema.isRetake !== null ? schema.isRetake : null,
    conditions: conditions,
    examPosition: schema.position ? mapPositionShort(schema.position) : null,
    examArea: schema.area ? mapAreaShort(schema.area) : null,
    examPayroll: schema.payrollId
      ? {
          id: schema.payrollId,
        }
      : null,
  };
}

export function mapExaminee(schema: any): IExaminee {
  const attempt = mapExamineeAttempt({
    schema: schema,
    currentRank: {
      rank: schema.employee.currentRank,
      rankScale: schema.employee.rankScale,
    },
  });
  const topic = mapExamineeTopic(schema.topic);

  return {
    id: schema.id,
    employee: mapExamineeEmployee(schema.employee),
    ...attempt,
    isPass: schema.isPass !== null ? schema.isPass : null,
    failedColumns: schema.failedColumns,
    isBelowAverageMinimum: schema.isBelowAverageMinimum ?? null,
    regStatus: {
      status: schema.registrationStatus as ExamRegistrationStatus,
      reason: schema.reason,
      note: schema.note,
    },
    departmentRegStatus:
      schema.departmentStatus != null
        ? {
            status: schema.departmentStatus as ExamRegistrationStatus,
            reason: schema.departmentReason,
            note: schema.departmentNote,
          }
        : null,
    adminRegStatus:
      schema.adminStatus != null
        ? {
            status: schema.adminStatus as ExamRegistrationStatus,
            reason: schema.adminReason,
            note: schema.adminNote,
          }
        : null,
    finalRegStatus:
      schema.finalStatus != null
        ? {
            status: schema.finalStatus as ExamRegistrationStatus,
            reason: schema.finalReason,
            note: null,
          }
        : null,
    takenExamStatus: schema.executionExamStatus as ExamineeTakenExamStatus,
    schedules: mapScheduleMap(schema.schedules),
    scores: mapExamScores(schema),
    topic: topic,
    mentor: schema.mentor ? mapExamineeEmployee(schema.mentor) : null,
    education:
      schema.isTrainingPass !== null
        ? {
            isPass: schema.isTrainingPass,
            evaluation: schema.evaluate,
          }
        : null,
    stage: schema.stage as ExamineeStage,
  };
}

export function mapExamScores(schema: any): IExamScore {
  const scores = schema.dynamicScores ?? {};
  const normalizedScores = Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [
      key,
      value && typeof value === "object" && "score" in value
        ? (value as { score?: number | null }).score ?? null
        : value,
    ])
  ) as Record<string, number | null>;

  return {
    ...normalizedScores,
    average: schema.averageScore ?? null,
    examiners: (schema.examinerScores ?? []).map((examiner: any) => ({
      id: examiner.id,
      employee: examiner.employee
        ? {
            id: examiner.employee.id,
            fullName: examiner.employee.fullName,
            code: examiner.employee.code,
            rank: {
              rank: examiner.employee.currentRank,
              rankScale: examiner.employee.rankScale,
            },
            area: mapAreaShort(examiner.employee.area),
          }
        : null,
      name: examiner.name,
      scores: normalizeExaminerScores(examiner.scores),
      evaluation: examiner.evaluation ?? null,
      note: examiner.note ?? null,
      noteVisible: examiner.noteVisibleEmployee ?? examiner.noteVisible ?? false,
    })),
  };
}

function normalizeExaminerScores(
  scores: unknown
): Record<string, number | null> {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) return {};

  return Object.fromEntries(
    Object.entries(scores as Record<string, unknown>).map(([key, value]) => [
      key,
      value && typeof value === "object" && "score" in value
        ? (value as { score?: number | null }).score ?? null
        : typeof value === "number"
          ? value
          : null,
    ])
  );
}

function mapScheduleMap(
  schedules: Record<string, any> | null | undefined
): Record<string, IExamSubjectSchedule | null> {
  return Object.fromEntries(
    Object.entries(schedules ?? {}).map(([key, schedule]) => [
      key,
      schedule
        ? {
            startDate: schedule.startDate ?? null,
            endDate: schedule.endDate ?? null,
            location: schedule.location ?? null,
            note: schedule.note ?? null,
          }
        : null,
    ])
  );
}

export function mapExamineeCondition({
  schema,
  currentRank,
}: {
  schema: any | string;
  currentRank: Partial<IRank>;
}): IExamineeConditionGroup[] {
  let data = null;

  if (typeof schema === "string") {
    data = JSON.parse(schema);
  } else {
    data = schema;
  }

  return data.map((group: any) => ({
    case: group.case,
    isMet: group.isMet,
    conditions: group.conditions.map(
      (condition: any) =>
        ({
          code: condition.code as ExamineeConditionCode,
          isMet: condition.isMet,
          data: {
            ...condition.data,
            currentRank: currentRank,
            eventMonth: condition.data?.examMonth,
          },
        }) as IExamineeCondition,
    ),
  }));
}
