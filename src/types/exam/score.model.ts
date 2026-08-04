import { IFile } from "../file.model";

export interface IExamScoreColumn {
  id?: string;
  key: string;
  name: string;
  minimumScore: number;
  canExaminerScore: boolean;
}

export interface IExamScoreConfig {
  scoreColumns: IExamScoreColumn[];
  averageScoreMinimum: number | null | undefined;
  averageScoreFormula: string | null | undefined;
  files: IFile[];
}
