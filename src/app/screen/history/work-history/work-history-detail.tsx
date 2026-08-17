import AppHeader from "@/components/app-header";
import { Field } from "@/components/Field";
import { FileBadge } from "@/components/file-badge";
import { ListFields } from "@/components/detail-fields/list-fields";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";
import { formatProcessDate } from "../employee-process-list";

export default function WorkHistoryDetail() {
  const item = useData((state) => state.itemData) as Record<string, any> | null;
  const { colors } = useTheme();
  const { displayDateDiff } = helper();
  const files = (item?.files ?? []).map((file: any) =>
    typeof file === "string" ? { id: file } : file,
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title={item?.position?.name ?? item?.positionName ?? "Quá trình công tác"}
        subtitle="Chi tiết quá trình công tác"
        onBack={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ListFields>
          <Field label="Từ ngày" value={formatProcessDate(item?.startDate)} />
          <Field
            label="Đến ngày"
            value={item?.endDate ? formatProcessDate(item.endDate) : "Hiện tại"}
          />
          <Field
            label="Đơn vị"
            value={
              item?.team?.name && item?.department?.name
                ? `${item.team.name} - ${item.department.name}`
                : item?.team?.name ?? item?.department?.name ?? item?.unitName
            }
          />
          <Field label="Chức danh" value={item?.position?.name ?? item?.positionName} />
          <Field
            label="Năm kinh nghiệm"
            value={
              item?.startDate
                ? displayDateDiff(new Date(item.startDate), item?.endDate ? new Date(item.endDate) : null)
                : "Chưa cập nhật"
            }
          />
          <Field label="Ghi chú" value={item?.note ?? "Chưa có"} />
          <Field
            label="File đính kèm"
            layout="column"
            value={<FileBadge files={files} />}
          />
        </ListFields>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
