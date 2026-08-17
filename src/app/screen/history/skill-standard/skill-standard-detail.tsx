import AppHeader from "@/components/app-header";
import DetailSectionHeader from "@/components/detail-section-header";
import { Field } from "@/components/Field";
import { ListFields } from "@/components/detail-fields/list-fields";
import { useData } from "@/hooks/zustand/useData";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { formatProcessDate } from "../employee-process-list";

function formatExperienceMonths(value: unknown) {
  if (typeof value !== "number") return "Chưa có";
  return `${Math.floor(value / 12)} năm ${value % 12} tháng`;
}

function getChildren(item: Record<string, any>) {
  const children = new Map<string, { current?: any; granted?: any }>();
  (item.grantedChildStandards ?? []).forEach((child: any) => {
    children.set(child.standardId, { granted: child });
  });
  (item.currentChildStandards ?? []).forEach((child: any) => {
    children.set(child.standardId, { ...children.get(child.standardId), current: child });
  });
  return [...children.values()];
}

export default function SkillStandardDetail() {
  const item = useData((state) => state.itemData) as Record<string, any> | null;
  const { colors } = useTheme();
  const children = item ? getChildren(item) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title={item?.groupName ?? "Tiêu chuẩn bậc thợ"}
        subtitle="Chi tiết tiêu chuẩn bậc thợ"
        onBack={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <ListFields>
          <Field label="Tên tiêu chuẩn" value={item?.groupName} />
          <Field label="Mã tiêu chuẩn" value={item?.groupId} />
          <Field label="Ngày cấp" value={formatProcessDate(item?.grantedDate)} />
          <Field label="Người cấp" value={item?.grantedByName ?? "Chưa có"} />
          <Field
            label="Cần cập nhật"
            value={item?.outdatedStandardCount ? `${item.outdatedStandardCount} tiêu chuẩn` : "Không"}
          />
          <Field label="Bậc hiện tại" value={item?.currentEmployeeSnapshot?.currentRank ?? "Chưa có"} />
          <Field
            label="Kinh nghiệm hiện tại"
            value={formatExperienceMonths(item?.currentEmployeeSnapshot?.experienceMonths)}
          />
        </ListFields>

        {children.map((entry, index) => {
          const current = entry.current ?? entry.granted;
          const currentRank = item?.currentEmployeeSnapshot?.currentRank;
          const currentExperience = item?.currentEmployeeSnapshot?.experienceMonths;
          const levelMet = currentRank !== null && currentRank !== undefined
            ? currentRank >= (current?.minLevel ?? 0)
            : Boolean(current?.isLevelMet);
          const experienceMet = currentExperience !== null && currentExperience !== undefined
            ? currentExperience >= (current?.experienceMonths ?? 0)
            : Boolean(current?.isExperienceMet);
          const courses = current?.courses ?? [];
          const otherRequirements = entry.granted?.otherRequirements ?? [];

          return (
            <View key={current?.standardId ?? index}>
              <DetailSectionHeader title={`${current?.standardCode ?? ""} - ${current?.standardName ?? "Tiêu chuẩn"}`} />
              <ListFields style={{ marginTop: 0 }}>
                <Field label="Tiêu chuẩn" value={`${current?.standardName ?? ""} (${current?.standardCode ?? ""})`} />
                <Field
                  label="Bậc tối thiểu"
                  value={<Text style={{ color: levelMet ? colors.primary : colors.error }}>{currentRank ?? "Chưa có"}</Text>}
                />
                <Field
                  label="Kinh nghiệm tối thiểu"
                  value={<Text style={{ color: experienceMet ? colors.primary : colors.error }}>{formatExperienceMonths(current?.experienceMonths)}</Text>}
                />
                <Field
                  label="Kinh nghiệm hiện tại"
                  value={formatExperienceMonths(item?.currentEmployeeSnapshot?.experienceMonths)}
                />
                <Field
                  label="Khóa đào tạo cần hoàn thành"
                  layout="column"
                  value={
                    courses.length ? (
                      <View style={{ gap: 6 }}>
                        {courses.map((course: any) => (
                          <Text key={course.id} style={{ color: course.completed ? colors.primary : colors.error }}>
                            {course.completed ? "✓" : "!"} {course.name}
                          </Text>
                        ))}
                      </View>
                    ) : "Chưa có"
                  }
                />
                <Field
                  label="Yêu cầu khác"
                  layout="column"
                  value={
                    otherRequirements.length ? (
                      <View style={{ gap: 8 }}>
                        {otherRequirements.map((requirement: string) => (
                          <View key={requirement}>
                            <Text style={{ color: colors.onSurface }}>{requirement}</Text>
                            <Text style={{ color: colors.onSurfaceVariant }}>
                              {entry.granted?.otherRequirementActuals?.[requirement] ?? "Chưa có đánh giá"}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : "Chưa có"
                  }
                />
              </ListFields>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
