import { IEmployee } from "@/types/employee/employee.model";
import { HighestEducationLevel } from "@/types/employee/enums/highest-education-level.enum";
import { ExamRegistrationStatus } from "@/types/exam/enums/exam-registration-status.enum";
import { ExamStatus } from "@/types/exam/enums/exam-status.enum";
import { ExamType } from "@/types/exam/enums/exam-type.enum";
import { ExamineeStage } from "@/types/exam/enums/examinee-stage.enum";
import { ExamineeTakenExamStatus } from "@/types/exam/enums/taken-exam-status.enum";
import {
  IExam,
  IExaminee,
  IExamineeAttempt,
  IExaminerScore,
  IExamRound,
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
import { mapExamineeTopic } from "./topic.mapper";

// Map GetExamRawSchema to IExamGeneralInfo
export function mapExam(schema: any): IExam {
  return {
    id: schema.id,
    name: schema.name,
    type: schema.examType.code as ExamType,
    round: schema.examRound ? mapExamRound(schema.examRound) : null,
    eventMonth: schema.examMonth,
    status: schema.status as ExamStatus,
    registrationStartDate: schema.registrationStartDate,
    registrationEndDate: schema.registrationEndDate,
    schedules: {
      safetyExam: {
        startDate: schema.schedules?.at.startDate ?? null,
        endDate: schema.schedules?.at.endDate ?? null,
        location: schema.schedules?.at.location ?? null,
        note: schema.schedules?.at.note ?? null,
      },
      corporateCulture: {
        startDate: schema.schedules?.vhdn.startDate ?? null,
        endDate: schema.schedules?.vhdn.endDate ?? null,
        location: schema.schedules?.vhdn.location ?? null,
        note: schema.schedules?.vhdn.note ?? null,
      },
      professional: {
        startDate: schema.schedules?.ltcm.startDate ?? null,
        endDate: schema.schedules?.ltcm.endDate ?? null,
        location: schema.schedules?.ltcm.location ?? null,
        note: schema.schedules?.ltcm.note ?? null,
      },
    },
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
    schedules: {
      practical: schema.schedule
        ? {
            startDate: schema.schedule.startDate,
            endDate: schema.schedule.endDate,
            location: schema.schedule.location,
            note: schema.schedule.note,
          }
        : null,
    },
    scores: {
      safetyExamScore: schema.scores.at.score,
      corporateCultureScore: schema.scores.vhdn.score,
      professionalScore: schema.scores.ltcm.score,
      practicalScore: schema.scores.th.score,
      examiners: schema.scores.th.examinerScore?.map((examiner: any) => {
        return {
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
          score: examiner.score,
          evaluation: examiner.evaluation,
          note: examiner.note,
          noteVisible: examiner.noteVisibleEmployee,
        } as IExaminerScore;
      }),
      averageScore: schema.finalScore,
    },
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
        } as IExamineeCondition)
    ),
  }));
}
