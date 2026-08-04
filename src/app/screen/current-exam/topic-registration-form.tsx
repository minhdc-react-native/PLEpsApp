import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import AppHeader from "@/components/app-header";
import FormWrapper from "@/components/formWrapper";
import VcSelectList from "@/components/vcSelectList";
import { getFullActiveTopic } from "@/helpers/topic.helpder";
import useCurrentExam from "@/hooks/useCurrentExam";
import { useData } from "@/hooks/zustand/useData";
import { mapArea } from "@/mappers/area.mapper";
import { IEmployee } from "@/types/employee/employee.model";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { EXAMINEE_STAGES } from "@/types/exam/enums/examinee-stage.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { TOPIC_STATUS } from "@/types/exam/enums/topic-status.enum";
import { IArea } from "@/types/system/area.model";
import { api } from "@/utils/epsApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput as NativeTextInput,
  View,
} from "react-native";
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
  const now = new Date();
  const isTopicWindowOpen =
    currentExam.exam.status === EXAM_STATUS.TOPIC_REGISTRATION &&
    !!currentExam.exam.topicSchedule.startDate &&
    !!currentExam.exam.topicSchedule.endDate &&
    now >= new Date(currentExam.exam.topicSchedule.startDate) &&
    now <= new Date(currentExam.exam.topicSchedule.endDate);
  const isReadOnly = !(
    currentExam.examinee.stage === EXAMINEE_STAGES.TOPIC &&
    currentExam.examinee.topic.status !== TOPIC_STATUS.ACCEPTED &&
    isTopicWindowOpen
  );
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
      <AppHeader
        title={currentExam.exam.name}
        subtitle="Đăng ký đề tài"
        onBack={() => router.back()}
      />
      <FormWrapper
        style={{
          padding: 20,
          paddingBottom: 0,
          gap: 24,
        }}
      >
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
                editable={!isReadOnly}
                error={!!errors.title}
                render={(inputProps) => {
                  const contentWidth = Math.max(
                    Dimensions.get("window").width - 40,
                    Math.ceil((value ?? "").length * 9.5) + 40
                  );

                  return (
                    <ScrollView
                      horizontal
                      bounces={false}
                      nestedScrollEnabled
                      showsHorizontalScrollIndicator={false}
                      style={styles.titleScroll}
                      contentContainerStyle={styles.titleScrollContent}
                    >
                      <NativeTextInput
                        {...inputProps}
                        style={[
                          inputProps.style,
                          styles.titleNativeInput,
                          { width: contentWidth },
                        ]}
                      />
                    </ScrollView>
                  );
                }}
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
                editable={!isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
              />
              {errors.mentorId && (
                <Text style={styles.error}>{errors.mentorId.message}</Text>
              )}
            </View>
          )}
        />
        <View style={{ height: isReadOnly ? 120 : 240 }} />
      </FormWrapper>
      {!isReadOnly && (
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
      )}
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
  titleScroll: {
    flex: 1,
  },
  titleScrollContent: {
    minWidth: "100%",
  },
  titleNativeInput: {
    flexGrow: 0,
  },
  error: {
    color: "red",
  },
});
