import EmployeeProcessList, {
  EmployeeProcessListItem,
  formatProcessPeriod,
} from "../employee-process-list";
import { getEmployeeWorkHistoriesApi } from "@/services/employee-process.service";
import { useCallback } from "react";
import { router } from "expo-router";
import { useData } from "@/hooks/zustand/useData";

export default function WorkHistoryManagement() {
  const setItemData = useData((state) => state.setItemData);
  const onItemPress = useCallback((item: EmployeeProcessListItem) => {
    setItemData({ ...item.data, id: item.id });
    router.push("/screen/history/work-history/work-history-detail");
  }, [setItemData]);
  const loadItems = useCallback(async (employeeId: string): Promise<EmployeeProcessListItem[]> => {
    const rows = await getEmployeeWorkHistoriesApi(employeeId);
    return rows.map((item, index) => ({
      id: String(item.id ?? index),
      title: item.positionName ?? item.position?.name ?? item.unitName ?? "Quá trình công tác",
      subtitle: [
        formatProcessPeriod(item.startDate, item.endDate),
        [item.department?.name, item.team?.name].filter(Boolean).join(" / "),
      ].filter(Boolean).join(" · "),
      icon: "briefcase-outline",
      data: item,
    }));
  }, []);

  return (
    <EmployeeProcessList
      title="Quá trình công tác"
      listTitle="Danh sách quá trình công tác"
      overviewIcon="briefcase-outline"
      emptyText="Chưa có quá trình công tác"
      loadItems={loadItems}
      onItemPress={onItemPress}
    />
  );
}
