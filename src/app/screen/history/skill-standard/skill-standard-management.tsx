import EmployeeProcessList, {
  EmployeeProcessListItem,
} from "../employee-process-list";
import { getEmployeeSkillStandardsApi } from "@/services/employee-process.service";
import { useCallback } from "react";
import { router } from "expo-router";
import { useData } from "@/hooks/zustand/useData";

export default function SkillStandardManagement() {
  const setItemData = useData((state) => state.setItemData);
  const onItemPress = useCallback((item: EmployeeProcessListItem) => {
    setItemData({ ...item.data, id: item.id });
    router.push("/screen/history/skill-standard/skill-standard-detail");
  }, [setItemData]);
  const loadItems = useCallback(async (employeeId: string): Promise<EmployeeProcessListItem[]> => {
    const rows = await getEmployeeSkillStandardsApi(employeeId);
    return rows.filter((item) => item.alreadyGranted).map((item, index) => {
      const standards = item.currentChildStandards ?? [];
      const completed = standards.filter(
        (standard: any) =>
          standard.isLevelMet &&
          standard.isExperienceMet &&
          standard.isCourseMet &&
          standard.isOtherRequirementsMet !== false,
      ).length;
      const isGranted = Boolean(item.alreadyGranted);

      return {
        id: String(item.groupId ?? index),
        title: item.groupName ?? "Tiêu chuẩn bậc thợ",
        subtitle: `${completed}/${standards.length} tiêu chuẩn đạt`,
        icon: "clipboard-check-outline",
        result: {
          label: isGranted ? "Đã cấp" : "Chưa cấp",
          color: isGranted ? "#087A52" : "#667085",
        },
        data: item,
      };
    });
  }, []);

  return (
    <EmployeeProcessList
      title="Tiêu chuẩn bậc thợ"
      listTitle="Danh sách tiêu chuẩn"
      overviewIcon="clipboard-check-outline"
      emptyText="Chưa có tiêu chuẩn bậc thợ"
      loadItems={loadItems}
      onItemPress={onItemPress}
    />
  );
}
