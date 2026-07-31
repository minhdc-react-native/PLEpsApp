import { useLoading } from "@/components/dialog/loadingProvider";
import { usePopup } from "@/components/dialog/popupProvider";
import { useToast } from "@/components/dialog/useToast";
import { StarRating } from "@/components/starRating";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { api } from "@/utils/epsApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Divider, Text, useTheme } from "react-native-paper";

export default function EmployeeRegister() {
  const { showToast } = useToast();
  const { showPopup } = usePopup();
  const { show, hide } = useLoading();
  const { colors } = useTheme();
  const currentExam = useData((state) => state.currentExam);
  const { formatDate } = helper();
  const onRegisterExam = () => {
    api.post({
      link: `/exams/${currentExam?.employeeExamPeriod?.id}/register`,
      data: {
        status: 1,
        notes: "",
        reason: "",
      },
      callBack: (res) => {
        showToast(res?.message, { type: "success" });
        router.back();
      },
      setLoading: (loading) => (loading ? show() : hide()),
    });
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Appbar */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
      </Appbar.Header>

      {/* Nội dung */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {currentExam?.employeeExamPeriod?.name}
        </Text>
        <Text style={styles.description}>
          {`Bạn nằm trong danh sách ${
            currentExam?.employeeExamPeriod?.examType?.name ?? "-"
          } đợt ${formatDate(
            currentExam?.employeeExamPeriod?.examMonth
          )}, vui lòng xác nhận đăng ký tham gia trước thời hạn.`}
        </Text>

        {/* Thông tin dự thi */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="text-box-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.sectionHeaderText}> Thông tin dự thi</Text>
        </View>
        <Divider />

        {/* Thông tin chi tiết */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.elevation.level1, gap: 5 },
          ]}
        >
          <View style={styles.row}>
            <Text style={styles.label}>Loại thi</Text>
            <Text style={styles.value}>
              {currentExam?.employeeExamPeriod?.examType?.name ?? "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Đợt</Text>
            <Text style={styles.value}>
              {formatDate(currentExam?.employeeExamPeriod?.examMonth)}
            </Text>
          </View>
          <Divider />
          <View style={styles.row}>
            <Text style={styles.label}>
              {`Bậc thợ hiện tại: `}
              <Text
                style={{ fontWeight: "bold", color: colors.primary }}
              >{`${currentExam?.examRegistration?.currentRank}/${currentExam?.examRegistration?.rankScale}`}</Text>
            </Text>
            <StarRating
              value={currentExam?.examRegistration?.currentRank ?? 0}
              max={currentExam?.examRegistration?.rankScale ?? 0}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              {`Bậc thợ thi: `}
              <Text
                style={{ fontWeight: "bold", color: colors.error }}
              >{`${currentExam?.examRegistration?.examRank}/${currentExam?.examRegistration?.rankScale}`}</Text>
            </Text>
            <StarRating
              value={currentExam?.examRegistration?.examRank ?? 0}
              max={currentExam?.examRegistration?.rankScale ?? 0}
            />
          </View>
        </View>
      </ScrollView>

      {/* Nút xác nhận */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => {
            showPopup({
              message: "Bạn có xác nhận tham gia kỳ thi này?",
              showCancel: true,
              cancelText: "Không",
              confirmText: "Có tham gia",
              onConfirm: onRegisterExam,
              iconType: "question",
              color: colors.primary,
            });
          }}
          style={{ marginHorizontal: 50 }}
        >
          Xác Nhận Tham Gia
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  infoBox: {
    borderRadius: 8,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  footer: {
    padding: 16,
  },
});
