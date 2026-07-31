import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import FormWrapper from "@/components/formWrapper";
import VcSelectList from "@/components/vcSelectList";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { api } from "@/utils/epsApi";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const topics = [
  {
    id: "DT-001",
    title:
      "Lập hồ sơ chuẩn bị và chỉ huy thực hiện công tác gia công trục, ống lót bộ phân ly, NMNĐ Vĩnh Tân 2",
  },
  { id: "DT-002", title: "Lập phương thuật đại tu bộ Debris Filter ST14 PM1" },
  {
    id: "DT-003",
    title:
      "Lập phương án kỹ thuật hàn phục hồi vỏ bơm chân không 1B, NMNĐ Mông Dương 1",
  },
  {
    id: "DT-004",
    title:
      "Lập hồ sơ chuẩn bị và chỉ huy trực tiếp công tác thay thế xích cào SDCC tổ máy S2 - Nhà máy Nhiệt điện Vĩnh Tân 4",
  },
  {
    id: "DT-005",
    title: "Nghiên cứu tối ưu quy trình súc rửa lò hơi số 2, NMNĐ Vĩnh Tân 4",
  },
  {
    id: "DT-006",
    title: "Lập phương án sửa chữa hệ thống băng tải than, NMNĐ Duyên Hải 1",
  },
  {
    id: "DT-007",
    title:
      "Thử nghiệm và hiệu chỉnh hệ thống đo lường nhiệt độ tuabin cao áp, NMNĐ Quảng Ninh",
  },
  {
    id: "DT-008",
    title:
      "Đề tài nghiên cứu cải tiến công nghệ xử lý tro bay cho lò hơi tầng sôi, NMNĐ Cẩm Phả",
  },
  {
    id: "DT-009",
    title:
      "Lập quy trình bảo dưỡng định kỳ cho máy nghiền than số 3, NMNĐ Mông Dương 2",
  },
  {
    id: "DT-010",
    title:
      "Đánh giá hiệu quả kinh tế - kỹ thuật khi thay thế vật liệu chịu lửa buồng đốt lò hơi, NMNĐ Vĩnh Tân 2",
  },
  {
    id: "DT-011",
    title:
      "Lập hồ sơ kỹ thuật và giám sát lắp đặt bơm nước tuần hoàn, NMNĐ Duyên Hải 3",
  },
  {
    id: "DT-012",
    title:
      "Đề xuất giải pháp cải tiến hệ thống khử lưu huỳnh (FGD), NMNĐ Vĩnh Tân 4",
  },
  {
    id: "DT-013",
    title: "Lập phương án thử tải máy phát điện số 1, NMNĐ Quảng Ninh",
  },
  {
    id: "DT-014",
    title:
      "Nghiên cứu ứng dụng công nghệ IoT trong giám sát độ rung tuabin, NMNĐ Mông Dương 1",
  },
  {
    id: "DT-015",
    title: "Xây dựng kế hoạch bảo dưỡng lớn định kỳ tổ máy S2, NMNĐ Vĩnh Tân 4",
  },
  {
    id: "DT-016",
    title:
      "Thí nghiệm hiệu chỉnh hệ thống điều khiển khói bụi ESP, NMNĐ Duyên Hải 1",
  },
];
interface IDataTopic {
  title: string;
  areaId: string | number | null;
  description: string;
}
const RegisterTopic = () => {
  const { colors } = useTheme();
  const { show, hide } = useLoading();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const currentExam = useData((state) => state.currentExam);
  const [dataTopic, setDataTopic] = useState<IDataTopic>({
    title: "",
    areaId: null,
    description: "",
  });
  const [areas, setAreas] = useState<IDataBase[]>([]);
  const { isNotEmpty } = helper();

  const onRegiterTopic = () => {
    if (
      !isNotEmpty(dataTopic.title) ||
      !isNotEmpty(dataTopic.areaId) ||
      !isNotEmpty(dataTopic.description)
    ) {
      showToast("Bạn chưa nhập đủ số liệu!", { type: "warning" });
      return;
    }
    api.post({
      link: `/topics/exam-periods/${currentExam?.employeeExamPeriod.id}/register`,
      data: dataTopic,
      callBack: (res) => {
        showToast("Đã đăng ký đề tài!", { type: "success" });
        router.back();
      },
      setLoading: (loading) => (loading ? show() : hide()),
    });
  };

  useEffect(() => {
    api.get({
      link: `/areas`,
      callBack: (res) => setAreas(res.returnData || []),
    });
  }, []);
  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={`Đăng ký: ${currentExam?.employeeExamPeriod?.name}`}
        />
      </Appbar.Header>
      <FormWrapper style={{ flex: 1, padding: 20, gap: 10 }}>
        <TextInput
          label="Tên đề tài"
          value={dataTopic.title}
          onChangeText={(value) =>
            setDataTopic((prev) => ({ ...prev, title: value }))
          }
          mode="outlined"
          style={styles.input}
        />
        <VcSelectList
          label="Chọn lĩnh vực"
          fDisplay={(item: any) => item.name}
          value={dataTopic.areaId || ""}
          data={areas}
          onChange={(item) =>
            setDataTopic((prev) => ({
              ...prev,
              areaId: item?.id.toString() || null,
            }))
          }
        />
        <TextInput
          label="Mô tả chi tiết"
          value={dataTopic.description}
          onChangeText={(value) =>
            setDataTopic((prev) => ({ ...prev, description: value }))
          }
          mode="outlined"
          multiline
          style={[styles.input, { height: 350 }]}
        />
        <Button mode="contained" onPress={onRegiterTopic}>
          Cập nhật
        </Button>
      </FormWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
});

export default RegisterTopic;
