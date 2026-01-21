export interface IPayroll {
  id: string;
  code: string;
  scale: number;
  name: string; // Ngạch lương
  description: string | null;
}
