import { ITeam } from "@/types/system/team.model";

export function mapTeam(schema: any): ITeam {
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    viewName: schema.viewName,
    shortName: schema.shortName,
    description: schema.description,
    type: schema.teamType,
  };
}

export function mapTeamShort(schema: any | undefined): Partial<ITeam> {
  if (!schema) return {};
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    viewName: schema.viewName,
    shortName: schema.shortName,
  };
}
