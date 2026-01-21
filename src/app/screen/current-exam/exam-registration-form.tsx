import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import FormWrapper from "@/components/formWrapper";
import useCurrentExam from "@/hooks/useCurrentExam";
import { useData } from "@/hooks/zustand/useData";
import { EXAM_REGISTRATION_STATUS } from "@/types/exam/enums/exam-registration-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { api } from "@/utils/epsApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  RadioButton,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import z from "zod";

export const schema = z
  .object({
    status: z.coerce.number({
      message: "Vui lòng xác nhận trạng thái tham gia.",
    }),
    reason: z.string().nullable(),
    note: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === EXAM_REGISTRATION_STATUS.PENDING) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng xác nhận trạng thái tham gia.",
        path: ["status"],
      });
    } else if (data.status === EXAM_REGISTRATION_STATUS.POSTPONED) {
      const reason = data.reason;
      if (
        reason == null ||
        (typeof reason === "string" && reason.trim() === "")
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập lý do hoãn thi.",
          path: ["reason"],
        });
      }
    }
  });

export default function ExamRegistrationForm() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const { bottom } = useSafeAreaInsets();
  const { showToast } = useToast();
  const { show, hide } = useLoading();
  const { refetch } = useCurrentExam();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status:
        currentExam?.examinee.regStatus.status ||
        EXAM_REGISTRATION_STATUS.SIGNED,
      reason: currentExam?.examinee.regStatus.reason,
      note: currentExam?.examinee.regStatus.note,
    },
  });

  // Function to handle form submission
  const onSubmit = (data: z.infer<typeof schema>) => {
    api.post({
      link: `/exams/${currentExam?.exam.id}/register`,
      data: data,
      callBack: (res) => {
        const message =
          data.status === EXAM_REGISTRATION_STATUS.SIGNED
            ? "Đã xác nhận đăng ký thi thành công!"
            : "Đã xác nhận hoãn thi thành công!";
        showToast(message, { type: "success" });
        refetch();
        router.back();
      },
      setLoading: (loading) => (loading ? show() : hide()),
    });
  };

  const status = watch("status");

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Đăng ký thi"} />
      </Appbar.Header>
      <FormWrapper style={{ flex: 1, padding: 20, gap: 8 }}>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <RadioButton.Group
              onValueChange={(value) => onChange(parseInt(value))}
              value={String(value)}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <RadioButton.Item
                  label="Tham gia thi"
                  labelStyle={{ fontWeight: "bold", color: "green" }}
                  value={EXAM_REGISTRATION_STATUS.SIGNED.toString()}
                />
                <RadioButton.Item
                  label="Hoãn thi"
                  labelStyle={{ fontWeight: "bold", color: "red" }}
                  value={EXAM_REGISTRATION_STATUS.POSTPONED.toString()}
                />
              </View>
            </RadioButton.Group>
          )}
        />

        {status === EXAM_REGISTRATION_STATUS.POSTPONED && (
          <Controller
            control={control}
            name="reason"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Lý do"
                  mode="outlined"
                  style={styles.input}
                  placeholder="Nhập lý do hoãn thi"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  error={!!errors.reason}
                />
                {errors.reason && (
                  <Text style={styles.error}>{errors.reason.message}</Text>
                )}
              </View>
            )}
          />
        )}
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
          Xác nhận
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
