import { IDecision } from "../exam/decision.model";
import { IPayroll } from "../system/payroll.model";
import { IPosition } from "../system/position.model";
import { IRank } from "../system/rank.model";

export interface ISalaryHistory {
  id: string;
  startDate: Date;
  payroll: Partial<IPayroll> | null;
  coefficient: number | null;
  endDate: Date | null;
  rank: IRank | null;
  nextPromotionDate: Date | null;
  yearsForPromotion: number | null;
  markSalaryDate: Date | null;
  decision: Partial<IDecision>;
  apply: boolean;
  position: Partial<IPosition>;
  lumpSum: number | null;
}
