import { ISalary, ISalaryVersion } from "@/types/system/salary.model";

export function mapSalary(schema: any): ISalary {
  return {
    payroll: {
      code: schema.payrollCode,
      scale: schema.scale,
    },
    level: schema.level,
    yearsForPromotion: schema.year,
    coefficient: schema.coefficient,
    id: schema.id,
  };
}

export function mapSalaryVersion(schema: any): ISalaryVersion {
  return {
    id: schema.id,
    name: schema.name,
    active: schema.active,
    activatedDate: schema.activatedDate,
  };
}
