import DetailTabBar from "@/components/detail-tab-bar";
import AppHeader from "@/components/app-header";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { TabView } from "react-native-tab-view";
import ExamHistoryManagement from "./exam/exam-history-management";
import SalaryHistoryManagement from "./salary/salary-history-management";
import TrainingHistoryScreen from "../training/history";

const routes = [
  { key: "salary", title: "Hưởng lương" },
  { key: "exam", title: "Thi cử" },
  { key: "training", title: "Đào tạo" },
];

export default function History() {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const requestedTab = Array.isArray(tab) ? tab[0] : tab;
  const initialIndex = Math.max(
    routes.findIndex((route) => route.key === requestedTab),
    0,
  );
  const [index, setIndex] = useState(initialIndex);

  const renderScene = ({ route }: { route: { key: string } }) => {
    if (route.key === "exam") return <ExamHistoryManagement />;
    if (route.key === "training") return <TrainingHistoryScreen embedded />;
    return <SalaryHistoryManagement />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Quá trình"
        onBack={() => router.back()}
        bottom={
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
        }
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={() => null}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}
