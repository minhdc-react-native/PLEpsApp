import VcSelector from "@/components/vcSelector";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Appbar, Divider, useTheme } from "react-native-paper";
import { SceneMap, TabView } from "react-native-tab-view";
import ExamHistoryManagement from "./exam/exam-history-management";
import SalaryHistoryManagement from "./salary/salary-history-management";

const renderScene = SceneMap({
  salary: SalaryHistoryManagement,
  exam: ExamHistoryManagement,
});
const routes = [
  { key: "salary", title: "Hưởng lương" },
  { key: "exam", title: "Thi cử" },
];

export default function History() {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Lịch sử" />
      </Appbar.Header>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={(pros) => (
          <>
            <VcSelector
              data={Object.values(routes).map((route) => ({
                id: route.key,
                value: route.title,
              }))}
              value={routes[index].key}
              onChange={(value) =>
                setIndex(routes.findIndex((r) => r.key === value.id))
              }
              type="line"
            />
            <Divider />
          </>
        )}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabLabel: {
    color: "#888",
    fontWeight: "400",
  },
  tabLabelActive: {
    color: "#007aff",
    fontWeight: "700",
  },
  tabUnderline: {
    marginTop: 4,
    height: 2,
    width: "100%",
    backgroundColor: "#007aff",
  },
});
