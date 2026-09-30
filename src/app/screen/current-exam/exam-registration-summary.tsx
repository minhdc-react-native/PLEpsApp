import DetailSectionHeader from "@/components/detail-section-header";
import { Field } from "@/components/Field";
import { ListFields } from "@/components/detail-fields/list-fields";
import { detailFieldStyles } from "@/components/detail-fields/styles";
import { ExamRegistrationStatusBadge } from "@/components/exam/exam-registration-status-badge";
import PersonSummary from "@/components/person-summary";
import { StarRating } from "@/components/starRating";
import { getExamScoreConfig } from "@/helpers/exam/score-config.helper";
import { helper } from "@/hooks/useHelper";
import type {
  IEmployeeExam,
  IExamRegistrationRecord,
  IExamSubjectSchedule,
} from "@/types/exam/exam.model";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface ExamRegistrationSummaryProps {
  exam: IEmployeeExam;
}

function RankValue({ rank, rankScale }: { rank?: number; rankScale?: number }) {
  const { colors } = useTheme();

  return (
    <View style={{ alignItems: "flex-end", gap: 6 }}>
      <Text style={{ fontSize: 16, lineHeight: 22, color: colors.onSurface }}>
        {`${rank ?? "-"}/${rankScale ?? "-"}`}
      </Text>
      <StarRating value={rank ?? 0} max={rankScale ?? 0} />
    </View>
  );
}

export default function ExamRegistrationSummary({
  exam,
}: ExamRegistrationSummaryProps) {
  const { colors } = useTheme();
  const { displayDate, displayDatetime } = helper();
  const scoreConfig = getExamScoreConfig(exam.exam);

  const renderRegistrationStatus = (
    status: IExamRegistrationRecord | null,
  ) => {
    if (!status) return null;

    return (
      <View style={detailFieldStyles.contentContainer}>
        <ExamRegistrationStatusBadge status={status.status} />
        {status.reason ? (
          <Text style={detailFieldStyles.text}>Lý do: {status.reason}</Text>
        ) : null}
        {status.note ? (
          <Text style={detailFieldStyles.text}>Ghi chú: {status.note}</Text>
        ) : null}
      </View>
    );
  };

  const renderSchedule = (name: string, schedule: IExamSubjectSchedule | null) => {
    if (!schedule) return null;

    return (
      <View key={name}>
        <DetailSectionHeader title={name} />
        <ListFields style={{ marginTop: 0 }}>
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
      </View>
    );
  };

  return (
    <View style={{ marginHorizontal: -4 }}>
      <DetailSectionHeader title="Thông tin thí sinh" inset={false} />
      {exam.exam.examType.editExamineeSalary ? (
        <ListFields style={{ marginHorizontal: 0, marginTop: 0 }}>
          <Field
            label={`Thời gian hưởng lương đến hết ${displayDate(exam.exam.eventMonth)}`}
            value={exam.examinee.salaryPeriod}
          />
          <Field
            label="Thời gian nâng lương theo quy định"
            value={`${exam.examinee.salaryYear} năm`}
          />
        </ListFields>
      ) : null}

      <ListFields style={{ marginHorizontal: 0 }}>
        <Field
          label="Bậc trước thi"
          value={
            <RankValue
              rank={exam.examinee.employee.rank?.rank}
              rankScale={exam.examinee.employee.rank?.rankScale}
            />
          }
        />
        <Field
          label="Bậc thi"
          value={
            <RankValue
              rank={exam.examinee.examRank.rank}
              rankScale={exam.examinee.examRank.rankScale}
            />
          }
        />
        <Field label="Bậc sau thi" value="" />
        <Field label="Chức danh cũ" value={exam.examinee.employee.position?.name} />
        <Field
          label="Chức danh mới"
          value={
            exam.examinee.examPosition?.name ??
            exam.examinee.employee.position?.name
          }
        />
        <Field label="Chuyên môn cũ" value={exam.examinee.employee.area?.name} />
        <Field
          label="Chuyên môn mới"
          value={exam.examinee.examArea?.name ?? exam.examinee.employee.area?.name}
        />
        <Field
          label="Ngày xét điều kiện"
          value={displayDate(exam.examinee.conditionDate)}
        />
      </ListFields>

      <DetailSectionHeader title="Thông tin đợt thi" inset={false} />
      <ListFields style={{ marginHorizontal: 0, marginTop: 0 }}>
        <Field label="Tên kỳ thi" value={exam.exam.name} />
        <Field label="Loại kỳ thi" value={exam.exam.examType.name} />
        <Field label="Đợt thi" value={exam.exam.round?.name} />
        <Field label="Ngày tổ chức" value={displayDate(exam.exam.eventMonth)} />
      </ListFields>

      <ListFields style={{ marginHorizontal: 0 }}>
        <Field
          label="Thi lại?"
          value={
            exam.examinee.retake ? (
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={colors.primary}
              />
            ) : null
          }
        />
        <Field
          label="Thí sinh đăng ký"
          value={renderRegistrationStatus(exam.examinee.regStatus)}
        />
        <Field
          label="Hiệu chỉnh phòng ban"
          value={renderRegistrationStatus(exam.examinee.departmentRegStatus)}
        />
        <Field
          label="Hiệu chỉnh Admin"
          value={renderRegistrationStatus(exam.examinee.adminRegStatus)}
        />
        <Field
          label="Kết quả đăng ký"
          value={renderRegistrationStatus(exam.examinee.finalRegStatus)}
        />
        <Field
          label="Người kèm cặp"
          layout="column"
          value={
            exam.examinee.mentor ? (
              <PersonSummary
                name={exam.examinee.mentor.fullName}
                imageUrl={exam.examinee.mentor.imageUrl}
                details={[
                  exam.examinee.mentor.area?.name ?? "Chưa có chuyên môn",
                  `Bậc ${exam.examinee.mentor.rank?.rank}/${exam.examinee.mentor.rank?.rankScale}`,
                ]}
              />
            ) : null
          }
        />
      </ListFields>

      {scoreConfig.scoreColumns.map((column) =>
        renderSchedule(column.name, exam.examinee.schedules[column.key]),
      )}
    </View>
  );
}
