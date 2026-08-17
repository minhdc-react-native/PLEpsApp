import { api } from "@/utils/epsApi";

export type EmployeeProcessRecord = Record<string, any>;

function asList(response: any): EmployeeProcessRecord[] {
  const data = response?.returnData ?? response?.data ?? response;
  const items = Array.isArray(data) ? data : data?.items;
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    if (!item || typeof item !== "object") return item;
    if (Array.isArray(item.files) && item.files.length > 0) return item;
    if (!Array.isArray(item.fileIds)) return item;

    return {
      ...item,
      files: item.fileIds.map((id: unknown) => ({ id })),
    };
  });
}

async function getEmployeeProcessList(link: string) {
  return asList(await api.get({ link }));
}

export function getEmployeeWorkHistoriesApi(employeeId: string) {
  return getEmployeeProcessList(`/employees/${employeeId}/work-histories`);
}

export function getEmployeeProjectHistoriesApi(employeeId: string) {
  return getEmployeeProcessList(`/employees/${employeeId}/project-histories`);
}

export function getEmployeeCertificatesApi(employeeId: string) {
  return getEmployeeProcessList(`/employees/${employeeId}/certificates`);
}

export function getEmployeeSkillStandardsApi(employeeId: string) {
  return getEmployeeProcessList(
    `/employees/skill-grade-standard-groups/${employeeId}`,
  );
}
