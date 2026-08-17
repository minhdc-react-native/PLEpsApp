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
import WorkHistoryManagement from "./work-history/work-history-management";
import ProjectHistoryManagement from "./project-history/project-history-management";
import CertificateHistoryManagement from "./certificate/certificate-history-management";
import SkillStandardManagement from "./skill-standard/skill-standard-management";

const routes = [
  { key: "salary", title: "Quá trình hưởng lương" },
  { key: "work-history", title: "Quá trình công tác" },
  { key: "project-history", title: "Quá trình tham gia công trình" },
  { key: "exam", title: "Quá trình thi" },
  { key: "training", title: "Quá trình đào tạo" },
  { key: "certificate", title: "Chứng chỉ" },
  { key: "skill-standard", title: "Tiêu chuẩn bậc thợ" },
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
    if (route.key === "work-history") return <WorkHistoryManagement />;
    if (route.key === "project-history") return <ProjectHistoryManagement />;
    if (route.key === "certificate") return <CertificateHistoryManagement />;
    if (route.key === "skill-standard") return <SkillStandardManagement />;
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
            mode="full"
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
