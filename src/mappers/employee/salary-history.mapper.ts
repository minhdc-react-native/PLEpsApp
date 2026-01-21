import { ISalaryHistory } from "@/types/employee/salary-history.model";
import { mapPositionShort } from "../position.mapper";

export function mapEmployeeSalaryHistory(schema: any): ISalaryHistory {
  return {
    id: schema.id,
    startDate: schema.effectiveDate,
    payroll: schema.payrollCode
      ? {
          code: schema.payrollCode,
        }
      : null,
    coefficient: schema.coefficient,
    endDate: schema.salaryEndDate,
    rank: schema.rank
      ? {
          rank: schema.rank,
          rankScale: schema.rankScale ?? 0,
        }
      : null,
    nextPromotionDate: schema.nextPromotionDate,
    markSalaryDate: schema.markSalaryDate,
    decision: {
      number: schema.number,
      signedDate: schema.signedDate,
      file: schema.fileId && {
        id: schema.fileId || undefined,
      },
    },
    yearsForPromotion: schema.salaryPeriod,
    apply: schema.apply,
    lumpSum: schema.lumpSum,
    position: mapPositionShort(schema.position),
  };
}
