import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import FormWrapper from "@/components/formWrapper";
import VcSelectList from "@/components/vcSelectList";
import { getFullActiveTopic } from "@/helpers/topic.helpder";
import useCurrentExam from "@/hooks/useCurrentExam";
import { useData } from "@/hooks/zustand/useData";
import { mapArea } from "@/mappers/area.mapper";
import { IEmployee } from "@/types/employee/employee.model";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { IArea } from "@/types/system/area.model";
import { api } from "@/utils/epsApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import z from "zod";

export const schema = z.object({
  title: z.string().min(1, { message: "Không được để trống." }),
  description: z.string().min(1, { message: "Không được để trống." }),
  areaId: z.string().min(1, { message: "Không được để trống." }),
  mentorId: z.string().nullish(),
});

export default function TopicRegistrationForm() {
  const user = useData((state) => state.user);
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const { bottom } = useSafeAreaInsets();
  const { showToast } = useToast();
  const { show, hide } = useLoading();
  const activeTopic = getFullActiveTopic(currentExam.examinee.topic);
  const [areas, setAreas] = useState<IArea[]>([]);
  const [mentors, setMentors] = useState<IEmployee[]>([]);
  const { refetch } = useCurrentExam();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: activeTopic?.name || "",
      description: activeTopic?.description || "",
      areaId: activeTopic?.area?.id || user?.area?.id || "",
      mentorId: currentExam.examinee.mentor?.id || null,
    },
  });

  useEffect(() => {
    api.get({
      link: `/areas`,
      callBack: (res) => {
        const mappedData = res.returnData.map((item: any) => mapArea(item));
        setAreas(mappedData);
      },
    });
  }, []);

  useEffect(() => {
    api.post({
      link: `/employees/search`,
      data: {
        departmentIds: [user?.department.id],
      },
      callBack: (res) => {
        setMentors(res.returnData.items);
      },
    });
  }, [user]);

  // Function to handle form submission
  const onSubmit = (data: z.infer<typeof schema>) => {
    api.post({
      link: `/topics/exam-periods/${currentExam.exam.id}/register`,
      data: data,
      callBack: (res) => {
        showToast("Cập nhật đề tài thành công", { type: "success" });
        refetch();
        router.back();
      },
      setLoading: (loading) => (loading ? show() : hide()),
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Đăng ký đề tài"} />
      </Appbar.Header>
      <FormWrapper style={{ flex: 1, padding: 20, gap: 24 }}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                label="Tên đề tài"
                mode="outlined"
                style={styles.input}
                placeholder="Nhập tên đề tài"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
                error={!!errors.title}
              />
              {errors.title && (
                <Text style={styles.error}>{errors.title.message}</Text>
              )}
            </View>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                label="Mô tả"
                mode="outlined"
                style={styles.input}
                placeholder="Nhập mô tả chi tiết"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
                error={!!errors.description}
                multiline
              />
              {errors.description && (
                <Text style={styles.error}>{errors.description.message}</Text>
              )}
            </View>
          )}
        />
        <Controller
          control={control}
          name="areaId"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <VcSelectList
                label="Chọn lĩnh vực"
                fDisplay={(item) => item?.name}
                value={value ?? ""}
                data={areas}
                onChange={(item) => onChange(item?.id)}
              />
              {errors.areaId && (
                <Text style={styles.error}>{errors.areaId.message}</Text>
              )}
            </View>
          )}
        />
        <Controller
          control={control}
          name="mentorId"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <VcSelectList
                label="Chọn người kèm cặp"
                fDisplay={(item) =>
                  `${item.fullName} - Bậc ${item.currentRank}/${item.rankScale}`
                }
                value={value ?? ""}
                data={mentors}
                onChange={(item) => onChange(item?.id)}
              />
              {errors.mentorId && (
                <Text style={styles.error}>{errors.mentorId.message}</Text>
              )}
            </View>
          )}
        />
      </FormWrapper>
      <Appbar
        style={[
          styles.bottom,
          {
            height: 100 + bottom,
          },
        ]}
        safeAreaInsets={{ bottom }}
      >
        <Button
          mode="contained"
          style={{ flex: 1, padding: 10 }}
          onPress={handleSubmit(onSubmit)}
        >
          Cập nhật
        </Button>
      </Appbar>
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
  },
});
