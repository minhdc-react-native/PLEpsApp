import { StarRating } from "@/components/starRating";
import { helper } from "@/hooks/useHelper";
import { useData } from "@/hooks/zustand/useData";
import { mapEmployeeSalaryHistory } from "@/mappers/employee/salary-history.mapper";
import { ISalaryHistory } from "@/types/employee/salary-history.model";
import { api } from "@/utils/epsApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { Badge, Card, Text, useTheme } from "react-native-paper";

export default function SalaryHistoryManagement() {
  const [data, setData] = useState<ISalaryHistory[]>([]);
  const { displayDate } = helper();
  const [loading, setLoading] = useState<boolean>(false);
  const user = useData((state) => state.user);
  const setItemData = useData((state) => state.setItemData);
  const onRefresh = () => {
    api.get({
      link: `/employees/salary-decision/${user?.id}`,
      callBack: (res) => {
        const mappedData = res.returnData.map((item: any) =>
          mapEmployeeSalaryHistory(item)
        );
        setData(mappedData);
      },
      setLoading: setLoading,
    });
  };

  useEffect(() => {
    onRefresh();
  }, []);
  const { colors } = useTheme();
  const renderItem = ({ item }: { item: ISalaryHistory }) => (
    <View style={styles.row}>
      <Card
        mode="outlined"
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
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
            router.navigate("/screen/history/salary/salary-history-detail");
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
              <Text variant="titleMedium">
                {`Ngạch ${item.payroll?.code}- Bậc ${item.rank?.rank}/${item.rank?.rankScale}`}
              </Text>
              {item?.apply && (
                <Badge
                  style={{
                    backgroundColor: colors.tertiary,
                    paddingHorizontal: 8,
                  }}
                >
                  Áp dụng
                </Badge>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.secondary }}>
                Ngày hưởng {displayDate(item?.startDate)}
              </Text>
            </View>
            <StarRating
              value={item?.rank?.rank ?? 0}
              max={item?.rank?.rankScale ?? 0}
            />
          </Card.Content>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </Pressable>
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      {/* {<Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Hưởng lương" />
                <Appbar.Action icon="magnify" onPress={() => { }} />
            </Appbar.Header>} */}

      <FlatList
        data={data}
        keyExtractor={(item, index) => `${index}`}
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
