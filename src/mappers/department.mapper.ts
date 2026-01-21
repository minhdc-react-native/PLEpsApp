import { IDepartment } from "@/types/system/department.model";

export function mapDepartment(schema: any): IDepartment {
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    shortName: schema.shortName,
    viewName: schema.viewName,
    type: schema.departmentType,
    areaId: schema.areaId,
  };
}

export function mapDepartmentShort(
  schema: any | undefined
): Partial<IDepartment> {
  if (!schema) return {};
  return {
    id: schema.id,
    code: schema.code,
    name: schema.name,
    shortName: schema.shortName,
    viewName: schema.viewName,
  };
}
