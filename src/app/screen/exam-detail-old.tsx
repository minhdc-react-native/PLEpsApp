import { Field } from "@/components/Field";
import { StarRating } from "@/components/starRating";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Badge,
  Card,
  Divider,
  Icon,
  Text,
  useTheme,
} from "react-native-paper";

export default function ExamDetail() {
  const itemData = useData((state) => state.itemData);
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Appbar */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        {/* <Appbar.Content title="Chi tiết kỳ thi" /> */}
      </Appbar.Header>
      <Text
        variant="titleLarge"
        style={{ fontWeight: "600", marginBottom: 4, marginHorizontal: 20 }}
      >
        {`${itemData?.exam.name}`}
      </Text>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        stickyHeaderIndices={[2]}
        showsVerticalScrollIndicator={false}
      >
        {/* Box kết quả */}
        <View
          style={[styles.resultRow, { backgroundColor: colors.background }]}
        >
          <Card style={styles.resultCard}>
            <View style={{ gap: 10, alignSelf: "center" }}>
              <Text style={styles.resultLabel}>Điểm TB</Text>
              <Text style={[styles.resultValue, { textAlign: "center" }]}>
                {itemData?.examinee.finalScore}
              </Text>
            </View>
          </Card>
          <Card style={styles.resultCard}>
            <View style={{ gap: 10, alignSelf: "center" }}>
              <Text style={[styles.resultLabel, { textAlign: "center" }]}>
                Kết quả
              </Text>
              {itemData?.examinee.isPass !== null && (
                <Badge
                  style={[
                    {
                      alignSelf: "flex-start",
                      backgroundColor: itemData?.examinee.isPass
                        ? "green"
                        : colors.error,
                      paddingHorizontal: 12,
                    },
                  ]}
                  size={28}
                >
                  {itemData?.examinee.isPass ? "Đạt" : "Không đạt"}
                </Badge>
              )}
            </View>
          </Card>
        </View>

        {/* Chi tiết */}
        <View>
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: colors.background, paddingHorizontal: 10 },
            ]}
          >
            <Icon
              source={"format-list-text"}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Chi tiết</Text>
          </View>
        </View>
        {/* Thông tin chi tiết */}
        <View style={{ paddingHorizontal: 10 }}>
          <Field label="Trạng thái đăng ký" value={itemData?.status} />
          <Divider style={{ marginBottom: 10 }} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Field
              label="Bậc thợ trước thi"
              value={`${itemData?.rank}/${itemData?.rankScale}`}
            />
            <StarRating
              value={itemData?.rank ?? 0}
              max={itemData?.rankScale ?? 0}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Field
              label="Bậc thợ thi"
              value={`${itemData?.finalScore}/${itemData?.rankScale}`}
            />
            <StarRating
              value={itemData?.finalScore ?? 0}
              max={itemData?.rankScale ?? 0}
            />
          </View>
          <Divider style={{ marginBottom: 10 }} />
          <Field label="Điểm thi an toàn" value={`.../10`} />
          <Field label="Điểm phần VHDN" value={`.../10`} />
          <Field label="Điểm lý thuyết" value={`.../10`} />
          <Text>Điểm vấn đáp</Text>
          <Field
            label="Giám khảo 1"
            value={`.../10`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 0,
            }}
          />
          <Text
            variant="bodyMedium"
            style={{ color: colors.secondary, marginBottom: 15 }}
          >
            Ghi chú:
          </Text>
          <Field
            label="Giám khảo 2"
            value={`.../10`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 0,
            }}
          />
          <Text
            variant="bodyMedium"
            style={{ color: colors.secondary, marginBottom: 15 }}
          >
            Ghi chú:
          </Text>
          <Field
            label="Giám khảo 3"
            value={`.../10`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 0,
            }}
          />
          <Text
            variant="bodyMedium"
            style={{ color: colors.secondary, marginBottom: 15 }}
          >
            Ghi chú:
          </Text>
          <Field
            label="Giám khảo 4"
            value={`.../10`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 0,
            }}
          />
          <Text
            variant="bodyMedium"
            style={{ color: colors.secondary, marginBottom: 15 }}
          >
            Ghi chú:
          </Text>
          <Divider style={{ marginBottom: 10 }} />
          <Field label="Nhận xét của hội đồng thi" value={`.....`} />
          <Field label="Ghi chú" value={`.....`} />
          <Divider style={{ marginBottom: 10 }} />
          <Field label="Điểm trung bình" value={itemData?.finalScore} />
          <Field
            label="Kết quả"
            value={itemData?.isPass ? "Đạt" : "Không đạt"}
          />
          <Divider style={{ marginBottom: 10 }} />
          <Field label="Quyết định số" value={`...`} />
          <Field label="Ngày ký" value={`...`} />
          <Field label="File" value={`???`} />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  resultCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
  },
  resultLabel: {
    fontWeight: "500",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
