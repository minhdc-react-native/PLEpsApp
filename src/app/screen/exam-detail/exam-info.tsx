import { ListFields } from "@/components/detail-fields/list-fields";
import { detailFieldStyles } from "@/components/detail-fields/styles";
import DetailSectionHeader from "@/components/detail-section-header";
import PersonSummary from "@/components/person-summary";
import { ExamRegistrationStatusBadge } from "@/components/exam/exam-registration-status-badge";
import { Field } from "@/components/Field";
import { FileBadge } from "@/components/file-badge";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import {
  IEmployeeExamHistory,
  IExamRegistrationRecord,
  IExamSubjectSchedule,
} from "@/types/exam/exam.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ExamDetailExamInfo() {
  const itemData = useData((state) => state.itemData) as IEmployeeExamHistory;
  const { colors } = useTheme();
  const { displayDate, displayDatetime } = helper();

  const renderRegStatus = (status: IExamRegistrationRecord | null) => {
    if (!status) return null;

    return (
      <View style={detailFieldStyles.contentContainer}>
        <ExamRegistrationStatusBadge status={status.status} />
        {status.reason && (
          <Text style={detailFieldStyles.text}>Lý do: {status.reason}</Text>
        )}
        {status.note && (
          <Text style={detailFieldStyles.text}>Ghi chú: {status.note}</Text>
        )}
      </View>
    );
  };

  const renderSchedule = (
    name: string,
    schedule: IExamSubjectSchedule | null
  ) => {
    if (!schedule) return null;

    return (
      <ListFields>
        <DetailSectionHeader title={name} />
        <Field
          label="Thời gian bắt đầu"
          value={displayDatetime(schedule.startDate)}
        />
        <Field
          label="Thời gian kết thúc"
          value={displayDatetime(schedule.endDate)}
        />
        <Field label="Địa điểm thi" value={schedule.location} />
        <Field label="Ghi chú" value={schedule.note} />
      </ListFields>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView style={styles.container} contentContainerStyle={{ gap: 16 }}>
        <ListFields>
          <Field label="Tên kỳ thi" value={itemData.exam.name} />
          <Field
            label="Loại kỳ thi"
            value={itemData.exam.examType.name}
          />
          <Field label="Đợt thi" value={itemData.exam.round?.name} />
          <Field
            label="Ngày tổ chức"
            value={displayDate(itemData.exam.eventMonth)}
          />
        </ListFields>
        <ListFields>
          <Field
            label="Thi lại?"
            value={
              itemData?.examinee.retake ? (
                <MaterialCommunityIcons name="check" size={24} color="blue" />
              ) : null
            }
          />
          <Field
            label="Thí sinh đăng ký"
            value={renderRegStatus(itemData.examinee.regStatus)}
          />
          <Field
            label="Hiệu chỉnh phòng ban"
            value={renderRegStatus(itemData.examinee.departmentRegStatus)}
          />
          <Field
            label="Hiệu chỉnh Admin"
            value={renderRegStatus(itemData.examinee.adminRegStatus)}
          />
          <Field
            label="Kết quả đăng ký"
            value={renderRegStatus(itemData.examinee.finalRegStatus)}
          />
          <Field
            label="Người kèm cặp"
            layout="column"
            value={
              itemData.examinee.mentor && (
                <PersonSummary
                  name={itemData.examinee.mentor.fullName}
                  imageUrl={itemData.examinee.mentor.imageUrl}
                  details={[
                    itemData.examinee.mentor.area?.name ??
                      "Chưa có chuyên môn",
                    `Bậc ${itemData.examinee.mentor.rank?.rank}/${itemData.examinee.mentor.rank?.rankScale}`,
                  ]}
                />
              )
            }
          />
        </ListFields>
        {renderSchedule("Thi an toàn", itemData.exam.schedules.safetyExam)}
        {renderSchedule(
          "Thi văn hóa doanh nghiệp",
          itemData.exam.schedules.corporateCulture
        )}
        {renderSchedule(
          "Thi lý thuyết chuyên môn",
          itemData.exam.schedules.professional
        )}
        {itemData.exam.examType.hasPractical &&
          renderSchedule(
            "Thi vấn đáp (thực hành)",
            itemData.examinee.schedules.practical
          )}
        <ListFields>
          <Field label="Quyết định số" value={itemData.exam.decision.number} />
          <Field
            label="Ngày ký quyết định"
            value={displayDate(itemData.exam.decision.signedDate)}
          />
          <Field
            label="File quyết định"
            layout="column"
            value={
              itemData.exam.decision.file && (
                <FileBadge file={itemData.exam.decision.file} />
              )
            }
          />
          <Field
            label="Ngày hiệu lực"
            value={displayDate(itemData.exam.decision.effectiveDate)}
          />
        </ListFields>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
