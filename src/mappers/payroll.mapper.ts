import { IPayroll } from "@/types/system/payroll.model";

export function mapPayroll(schema: any): IPayroll {
  return {
    id: schema.id,
    code: schema.code,
    scale: schema.scale,
    name: schema.name,
    description: schema.description,
  };
}
