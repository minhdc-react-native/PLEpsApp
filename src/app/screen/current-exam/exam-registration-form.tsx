import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import AppHeader from "@/components/app-header";
import FormWrapper from "@/components/formWrapper";
import { FileBadge } from "@/components/file-badge";
import {
  appendUploadFilesToFormData,
  fetchFilesByIds,
  isStoredUploadFile,
  isUploadFileValue,
  mergeUploadFiles,
} from "@/helpers/file-upload.helper";
import type { LocalUploadFile, UploadFileValue } from "@/helpers/file-upload.helper";
import useCurrentExam from "@/hooks/useCurrentExam";
import { useData } from "@/hooks/zustand/useData";
import { getFinalStatus } from "@/helpers/exam.helpder";
import { EXAM_REGISTRATION_STATUS } from "@/types/exam/enums/exam-registration-status.enum";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { IEmployeeExam } from "@/types/exam/exam.model";
import { api } from "@/utils/epsApi";
import * as DocumentPicker from "expo-document-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  IconButton,
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
    files: z.array(z.custom<UploadFileValue>(isUploadFileValue)),
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

type ExamRegistrationFormValues = z.infer<typeof schema>;

export default function ExamRegistrationForm() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam;
  const { bottom } = useSafeAreaInsets();
  const { showToast } = useToast();
  const { show, hide } = useLoading();
  const { refetch } = useCurrentExam();
  const registrationFileIds = currentExam.examinee.registrationFileIds ?? [];
  const registrationFileIdsKey = registrationFileIds.join("|");
  const [isLoadingRegistrationFiles, setIsLoadingRegistrationFiles] = useState(
    registrationFileIds.length > 0,
  );
  const [registrationFilesLoadFailed, setRegistrationFilesLoadFailed] =
    useState(false);
  const now = new Date();
  const isRegistrationWindowOpen =
    currentExam.exam.status === EXAM_STATUS.REGISTRATION &&
    !!currentExam.exam.registrationStartDate &&
    !!currentExam.exam.registrationEndDate &&
    now >= new Date(currentExam.exam.registrationStartDate) &&
    now <= new Date(currentExam.exam.registrationEndDate);
  const isReadOnly =
    getFinalStatus(currentExam.examinee) === EXAM_REGISTRATION_STATUS.ADDED ||
    !isRegistrationWindowOpen;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm<ExamRegistrationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status:
        currentExam?.examinee.regStatus.status ||
        EXAM_REGISTRATION_STATUS.SIGNED,
      reason: currentExam?.examinee.regStatus.reason,
      note: currentExam?.examinee.regStatus.note,
      files: [],
    },
  });

  useEffect(() => {
    let isCurrent = true;
    setIsLoadingRegistrationFiles(registrationFileIds.length > 0);
    setRegistrationFilesLoadFailed(false);

    const loadRegistrationFiles = async () => {
      try {
        const files = await fetchFilesByIds(registrationFileIds);
        if (isCurrent) {
          setValue("files", files, { shouldDirty: false });
        }
      } catch {
        if (isCurrent) {
          setRegistrationFilesLoadFailed(true);
          showToast("Không thể tải tệp đã đính kèm. Vui lòng thử tải lại màn hình.", {
            type: "error",
          });
        }
      } finally {
        if (isCurrent) setIsLoadingRegistrationFiles(false);
      }
    };

    void loadRegistrationFiles();
    return () => {
      isCurrent = false;
    };
  }, [registrationFileIdsKey, setValue, showToast]);

  // Pick one or more supporting files for a postponement request.
  const pickAttachments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const newFiles: LocalUploadFile[] = result.assets.map((file) => ({
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
    }));
    setValue("files", mergeUploadFiles(getValues("files"), newFiles), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: ExamRegistrationFormValues) => {
    const formData = new FormData();
    formData.append("status", String(data.status));
    if (data.reason) formData.append("reason", data.reason);
    if (data.note) formData.append("note", data.note);

    if (data.status === EXAM_REGISTRATION_STATUS.POSTPONED) {
      appendUploadFilesToFormData(formData, data.files);
    }

    try {
      await api.post({
        link: `/exams/${currentExam?.exam.id}/register`,
        data: formData,
        config: {
          headers: { "Content-Type": "multipart/form-data" },
        },
        callBack: () => {
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
    } catch (error: any) {
      showToast(error?.message ?? "Không thể cập nhật đăng ký thi", { type: "error" });
    }
  };

  const status = watch("status");

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        title={currentExam.exam.name}
        subtitle="Đăng ký thi"
        onBack={() => router.back()}
      />
      <FormWrapper
        style={{
          padding: 20,
          paddingBottom: 0,
          gap: 8,
        }}
      >
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <RadioButton.Group
              onValueChange={(value) => {
                if (!isReadOnly) onChange(parseInt(value));
              }}
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
                  disabled={isReadOnly}
                />
                <RadioButton.Item
                  label="Hoãn thi"
                  labelStyle={{ fontWeight: "bold", color: "red" }}
                  value={EXAM_REGISTRATION_STATUS.POSTPONED.toString()}
                  disabled={isReadOnly}
                />
              </View>
            </RadioButton.Group>
          )}
        />

        {status === EXAM_REGISTRATION_STATUS.POSTPONED && (
          <>
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
                    editable={!isReadOnly}
                    error={!!errors.reason}
                  />
                  {errors.reason && (
                    <Text style={styles.error}>{errors.reason.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="files"
              render={({ field: { value } }) => (
                <View style={styles.attachments}>
                  <Text variant="titleSmall" style={styles.attachmentTitle}>
                    Tệp đính kèm
                  </Text>
                  {isLoadingRegistrationFiles ? (
                    <Text>Đang tải tệp đã đính kèm...</Text>
                  ) : null}
                  {registrationFilesLoadFailed ? (
                    <Text style={styles.error}>
                      Không thể tải tệp cũ. Không thể gửi cập nhật để tránh mất tệp.
                    </Text>
                  ) : null}
                  {(value ?? []).map((file, index) => (
                    <View
                      key={isStoredUploadFile(file) ? `id:${file.id}` : `uri:${file.uri}`}
                      style={styles.uploadFileRow}
                    >
                      <View style={styles.uploadFileContent}>
                        {isStoredUploadFile(file) ? (
                          <FileBadge file={file} />
                        ) : (
                          <View style={styles.selectedFile}>
                            <Text numberOfLines={1} style={styles.selectedFileName}>
                              {file.name}
                            </Text>
                          </View>
                        )}
                      </View>
                      {!isReadOnly ? (
                        <IconButton
                          icon="close"
                          size={18}
                          onPress={() => {
                            const files = getValues("files").filter(
                              (_, itemIndex) => itemIndex !== index,
                            );
                            setValue("files", files, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          accessibilityLabel="Xóa tệp đính kèm"
                        />
                      ) : null}
                    </View>
                  ))}
                  {!isReadOnly ? (
                    <Button
                      mode="outlined"
                      icon="paperclip"
                      disabled={isLoadingRegistrationFiles || registrationFilesLoadFailed}
                      onPress={() => void pickAttachments()}
                    >
                      Chọn tệp
                    </Button>
                  ) : null}
                </View>
              )}
            />
          </>
        )}
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
            disabled={isLoadingRegistrationFiles || registrationFilesLoadFailed}
            onPress={handleSubmit(onSubmit)}
          >
            Xác nhận
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
  error: {
    color: "red",
  },
  attachments: {
    gap: 8,
    marginTop: 4,
  },
  attachmentTitle: {
    fontWeight: "700",
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 12,
  },
  selectedFileName: {
    flex: 1,
  },
  uploadFileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  uploadFileContent: {
    flex: 1,
    minWidth: 0,
  },
});
