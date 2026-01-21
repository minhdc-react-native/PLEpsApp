import { IFile } from "../file.model";

export interface IDecision {
  number: string | null;
  file: Partial<IFile> | null;
  signedDate: Date | null;
}

export interface IFinalDecision extends IDecision {
  effectiveDate: Date | null;
}
