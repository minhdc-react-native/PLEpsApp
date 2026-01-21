import { ListFields } from "@/components/detail-fields/list-fields";
import { TopicStatusBadge } from "@/components/exam/topic-status-badge";
import { Field } from "@/components/Field";
import { FileBadge } from "@/components/file-badge";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

export default function ExamDetailTopicInfo() {
  const itemData = useData((state) => state.itemData) as IEmployeeExamHistory;
  const { colors } = useTheme();
  const { displayDatetime } = helper();
  return (
    <View style={{ flex: 1, backgroundColor: colors.elevation.level1 }}>
      {itemData.examinee.topic.status !== null ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ gap: 16 }}
        >
          <ListFields>
            <Field
              label="Tên đề tài"
              value={itemData.examinee.topic.activeTopic?.name}
            />
            <Field
              label="Lĩnh vực"
              value={itemData.examinee.topic.activeTopic?.area.name}
            />
            <Field
              label="Trạng thái"
              value={
                <TopicStatusBadge status={itemData.examinee.topic.status} />
              }
            />
            <Field
              label="Mô tả chi tiết"
              value={itemData.examinee.topic.activeTopic?.description}
            />
            <Field
              label="File đề tài"
              value={
                itemData.examinee.topic.file && (
                  <FileBadge file={itemData.examinee.topic.file} />
                )
              }
            />
          </ListFields>
          <View
            style={{
              gap: 4,
              flexDirection: "row",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <Icon source="calendar" size={16} />
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant="titleMedium">
                Lịch sử thay đổi ({itemData.examinee.topic.history.length})
              </Text>
            </View>
          </View>
          {itemData.examinee.topic.history.map((item, index) => (
            <ListFields key={index}>
              <Field label="Tên đề tài" value={item.name} />
              <Field label="Lĩnh vực" value={item.area.name} />
              <Field label="Mô tả chi tiết" value={item.description} />
              <Field label="Từ chối bởi" value={item.rejectedBy?.fullName} />
              <Field
                label="Lúc"
                value={displayDatetime(item.rejectedAt, "--")}
              />
              <Field label="Lý do" value={item.reason} />
            </ListFields>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 100,
          }}
        >
          <Text>Thí sinh chưa có đề tài</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
