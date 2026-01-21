import { IArea } from "@/types/system/area.model";

export function mapArea(schema: any): IArea {
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    viewName: schema.viewName,
    shortName: schema.shortName,
    description: schema.description,
  };
}

export function mapAreaShort(schema: any | undefined): Partial<IArea> {
  if (!schema) return {};
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    viewName: schema.viewName,
    shortName: schema.shortName,
  };
}
