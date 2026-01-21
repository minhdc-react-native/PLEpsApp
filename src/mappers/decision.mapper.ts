import { IDecision, IFinalDecision } from "@/types/exam/decision.model";

export function mapDecision(schema: any): IDecision {
  return {
    number: schema.number,
    signedDate: schema.signedDate,
    file: schema.fileId
      ? {
          id: schema.fileId ?? null,
        }
      : null,
  };
}

export function mapFinalDecision(schema: any): IFinalDecision {
  const decision = mapDecision(schema);
  return {
    ...decision,
    effectiveDate: schema.effectiveDate,
  };
}
