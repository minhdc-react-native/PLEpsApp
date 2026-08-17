import EmployeeProcessList, {
  EmployeeProcessListItem,
  formatProcessDate,
} from "../employee-process-list";
import { getEmployeeCertificatesApi } from "@/services/employee-process.service";
import { useCallback } from "react";
import { router } from "expo-router";
import { useData } from "@/hooks/zustand/useData";

export default function CertificateHistoryManagement() {
  const setItemData = useData((state) => state.setItemData);
  const onItemPress = useCallback((item: EmployeeProcessListItem) => {
    setItemData({ ...item.data, id: item.id });
    router.push("/screen/history/certificate/certificate-history-detail");
  }, [setItemData]);
  const loadItems = useCallback(async (employeeId: string): Promise<EmployeeProcessListItem[]> => {
    const rows = await getEmployeeCertificatesApi(employeeId);
    return rows.map((item, index) => {
      const expired = item.isExpired || item.status === "revoked";
      return {
        id: String(item.id ?? index),
        title: item.certificateTypeName ?? item.name ?? "Chứng chỉ",
        subtitle: [
          item.certificateNumber,
          `Ngày cấp: ${formatProcessDate(item.issueDate)}`,
          item.expireAt ? `Hết hạn: ${formatProcessDate(item.expireAt)}` : null,
        ].filter(Boolean).join(" · "),
        icon: "certificate-outline",
        result: {
          label: expired ? "Không còn hiệu lực" : "Còn hiệu lực",
          color: expired ? "#BA1A1A" : "#087A52",
        },
        data: item,
      };
    });
  }, []);

  return (
    <EmployeeProcessList
      title="Chứng chỉ"
      listTitle="Danh sách chứng chỉ"
      overviewIcon="certificate-outline"
      emptyText="Chưa có chứng chỉ"
      loadItems={loadItems}
      onItemPress={onItemPress}
    />
  );
}
