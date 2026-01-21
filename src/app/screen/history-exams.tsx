import { useData } from "@/hooks/zustand/useData";
import { mapEmployeeExamHistory } from "@/mappers/employee/exam-history.mapper";
import {
  EXAM_REGISTRATION_STATUS,
  EXAM_REGISTRATION_STATUS_LABELS,
  ExamRegistrationStatus,
} from "@/types/exam/enums/exam-registration-status.enum";
import { api } from "@/utils/epsApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { Badge, Card, Text, useTheme } from "react-native-paper";

export default function HistoryExams() {
  const [data, setData] = useState<IDataBase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useData((state) => state.user);
  const setItemData = useData((state) => state.setItemData);
  const onRefresh = () => {
    api.get({
      link: `/employees/period-history/${user?.id}`,
      callBack: (res) => {
        setData(
          res.returnData.map((item: any) => mapEmployeeExamHistory(item))
        );
      },
      setLoading: setLoading,
    });
  };

  useEffect(() => {
    onRefresh();
  }, []);
  const { colors } = useTheme();
  const renderItem = ({ item }: any) => (
    <View style={styles.row}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
            },
          ]}
          onPress={() => {
            setItemData(item);
            router.navigate("/screen/exam-detail");
          }}
        >
          <Card.Content style={{ flex: 1, gap: 10 }}>
            <View
              style={{
                marginTop: 6,
                gap: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text variant="titleMedium">{item.exam.name}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.secondary }}>
                Bậc thi: {item.examinee.examRank} /{" "}
                {item.examinee.examRankScale}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {(item.examinee.finalStatus ===
                EXAM_REGISTRATION_STATUS.POSTPONED ||
                item.examinee.finalStatus ===
                  EXAM_REGISTRATION_STATUS.REJECTED) && (
                <Badge
                  style={{
                    paddingHorizontal: 8,
                    backgroundColor: "gray",
                    marginBottom: 8,
                  }}
                >
                  {
                    EXAM_REGISTRATION_STATUS_LABELS[
                      item.examinee.finalStatus as ExamRegistrationStatus
                    ]
                  }
                </Badge>
              )}
              {item.examinee.isPass !== null && (
                <Badge
                  style={{
                    paddingHorizontal: 8,
                    backgroundColor: item.examinee.isPass
                      ? "green"
                      : colors.error,
                    marginBottom: 8,
                  }}
                >
                  {item.examinee.isPass ? "Đạt" : "Không đạt"}
                </Badge>
              )}
            </View>
          </Card.Content>
          <MaterialCommunityIcons name="chevron-right" size={24} color="gray" />
        </Pressable>
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]} // màu vòng quay (Android)
            tintColor={colors.primary} // màu vòng quay (iOS)
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  timeline: {
    width: 20,
    alignItems: "center",
    position: "relative",
  },
  date: { fontWeight: "700", fontSize: 16 },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: "white",
    zIndex: 1,
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#ddd",
    marginTop: 30,
  },
  card: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    elevation: 2,
  },
  chip: {
    alignSelf: "flex-start",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  metaText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 13,
  },
});
