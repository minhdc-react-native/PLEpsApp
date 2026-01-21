export interface IDepartment {
  id: string;
  code: string;
  name: string;
  shortName: string | null;
  viewName: string | null;
  type: number;
  areaId: string | null;
}
