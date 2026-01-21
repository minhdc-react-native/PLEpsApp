export interface IPosition {
  id: string;
  name: string;
  shortName: string | null;
  viewName: string | null;
  description: string | null;
  code: string;
  level: number;
  type: number | null;
}
