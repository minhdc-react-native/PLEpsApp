import { IPayroll } from "./payroll.model";

export interface ISalary {
  payroll: Partial<IPayroll>;
  level: number;
  yearsForPromotion: number | null;
  coefficient: number;
  id: string;
}

export interface ISalaryGroup {
  scale: number;
  levels: number[];
}

export interface ISalaryVersion {
  id: string;
  name: string;
  active: boolean;
  activatedDate: Date;
}
