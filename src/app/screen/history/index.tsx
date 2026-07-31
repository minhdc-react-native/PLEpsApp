import DetailTabBar from "@/components/detail-tab-bar";
import { router } from "expo-router";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
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
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Appbar.Header
        mode="small"
        elevated={false}
        style={{ backgroundColor: colors.surface }}
      >
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Lịch sử" />
      </Appbar.Header>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={() => (
          <DetailTabBar
            data={routes.map((route) => ({
              id: route.key,
              value: route.title,
            }))}
            value={routes[index].key}
            onChange={(value) =>
              setIndex(routes.findIndex((route) => route.key === value.id))
            }
            mode="fit"
          />
        )}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}
