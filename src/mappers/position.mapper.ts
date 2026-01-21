import { IPosition } from "@/types/system/position.model";

export function mapPosition(schema: any): IPosition {
  return {
    id: schema.id,
    name: schema.name,
    shortName: schema.shortName,
    viewName: schema.viewName,
    description: schema.description,
    code: schema.code,
    level: schema.level,
    type: schema.type,
  };
}

export function mapPositionShort(schema: any | undefined): Partial<IPosition> {
  if (!schema) return {};
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    shortName: schema.shortName,
    viewName: schema.viewName,
  };
}
