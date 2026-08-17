import AppHeader from "@/components/app-header";
import { Field } from "@/components/Field";
import { FileBadge } from "@/components/file-badge";
import { ListFields } from "@/components/detail-fields/list-fields";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";
import { formatProcessDate } from "../employee-process-list";

export default function ProjectHistoryDetail() {
  const item = useData((state) => state.itemData) as Record<string, any> | null;
  const { colors } = useTheme();
  const files = (item?.files ?? []).map((file: any) =>
    typeof file === "string" ? { id: file } : file,
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title={item?.projectName ?? "Quá trình tham gia công trình"}
        subtitle="Chi tiết quá trình tham gia công trình"
        onBack={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ListFields>
          <Field label="Từ ngày" value={formatProcessDate(item?.startDate)} />
          <Field
            label="Đến ngày"
            value={item?.endDate ? formatProcessDate(item.endDate) : "Hiện tại"}
          />
          <Field label="Tên công trình" value={item?.projectName} />
          <Field
            label="Nội dung thực hiện chính"
            layout="column"
            value={item?.mainWorkContent ?? item?.mainContent ?? "Chưa có"}
          />
          <Field label="File đính kèm" layout="column" value={<FileBadge files={files} />} />
        </ListFields>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
