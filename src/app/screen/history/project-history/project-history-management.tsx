import EmployeeProcessList, {
  EmployeeProcessListItem,
  formatProcessPeriod,
} from "../employee-process-list";
import { getEmployeeProjectHistoriesApi } from "@/services/employee-process.service";
import { useCallback } from "react";
import { router } from "expo-router";
import { useData } from "@/hooks/zustand/useData";

export default function ProjectHistoryManagement() {
  const setItemData = useData((state) => state.setItemData);
  const onItemPress = useCallback((item: EmployeeProcessListItem) => {
    setItemData({ ...item.data, id: item.id });
    router.push("/screen/history/project-history/project-history-detail");
  }, [setItemData]);
  const loadItems = useCallback(async (employeeId: string): Promise<EmployeeProcessListItem[]> => {
    const rows = await getEmployeeProjectHistoriesApi(employeeId);
    return rows.map((item, index) => ({
      id: String(item.id ?? index),
      title: item.projectName ?? "Quá trình tham gia công trình",
      subtitle: [
        formatProcessPeriod(item.startDate, item.endDate),
        item.mainWorkContent ?? item.mainContent,
      ].filter(Boolean).join(" · "),
      icon: "office-building-outline",
      data: item,
    }));
  }, []);

  return (
    <EmployeeProcessList
      listTitle="Danh sách công trình"
      emptyText="Chưa có quá trình tham gia công trình"
      loadItems={loadItems}
      onItemPress={onItemPress}
    />
  );
}
