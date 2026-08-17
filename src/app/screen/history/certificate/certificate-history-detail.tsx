import AppHeader from "@/components/app-header";
import { Field } from "@/components/Field";
import { ListFields } from "@/components/detail-fields/list-fields";
import { useData } from "@/hooks/zustand/useData";
import { normalizeUrl } from "@/utils/url";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { formatProcessDate } from "../employee-process-list";

export default function CertificateHistoryDetail() {
  const item = useData((state) => state.itemData) as Record<string, any> | null;
  const { colors } = useTheme();
  const expired = Boolean(item?.isExpired || item?.status === "revoked");
  const certificateTitle = item?.name ?? item?.template?.name ?? "Chứng chỉ";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title={certificateTitle}
        subtitle="Chi tiết chứng chỉ"
        onBack={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ListFields>
          <Field label="Tên chứng chỉ" value={certificateTitle} />
          <Field label="Số chứng chỉ" value={item?.certificateNumber ?? "Chưa có"} />
          <Field label="Loại chứng chỉ" value={item?.certificateTypeName} />
          <Field label="Ngày cấp" value={formatProcessDate(item?.issueDate)} />
          <Field
            label="Ngày hết hạn"
            value={item?.expireAt ? formatProcessDate(item.expireAt) : "Không thời hạn"}
          />
          <Field
            label="Trạng thái"
            value={
              <Text style={{ color: expired ? colors.error : colors.primary }}>
                {expired ? "Không còn hiệu lực" : "Còn hiệu lực"}
              </Text>
            }
          />
          <Field
            label="Nguồn cấp"
            value={item?.origin === "training" ? "Chứng chỉ đào tạo" : "Nhập tại hồ sơ nhân sự"}
          />
          <Field
            label="Nguồn chứng chỉ"
            value={item?.source === "template" ? "Tạo từ mẫu hệ thống" : "Up ảnh chứng chỉ"}
          />
          <Field
            label="Mẫu chứng chỉ"
            value={
              item?.template
                ? `${item.template.name} (${item.template.code ?? ""})`
                : "Không sử dụng mẫu hệ thống"
            }
          />
          <Field label="Ghi chú" value={item?.note ?? "Không có"} />
          <Field
            label="Ảnh chứng chỉ"
            layout="column"
            value={
              item?.imageUrl ? (
                <Image
                  source={{ uri: normalizeUrl(item.imageUrl) }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                "Chưa có ảnh chứng chỉ"
              )
            }
          />
        </ListFields>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 360,
    borderRadius: 12,
  },
});
