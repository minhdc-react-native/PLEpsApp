import LoadingScreen from "@/components/loading-screen";
import DetailTabBar from "@/components/detail-tab-bar";
import AppHeader from "@/components/app-header";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import { router, useLocalSearchParams } from "expo-router";

import { useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabView } from "react-native-tab-view";
import ExamDetailEducationInfo from "./education";
import ExamDetailExamInfo from "./exam-info";
import ExamDetailExamineeGeneralInfo from "./examinee-general-info";
import ExamDetailScoresInfo from "./scores";
import ExamDetailTopicInfo from "./topic";

const mapComponent = {
  "examinee-general-info": ExamDetailExamineeGeneralInfo,
  "exam-info": ExamDetailExamInfo,
  topic: ExamDetailTopicInfo,
  education: ExamDetailEducationInfo,
  scores: ExamDetailScoresInfo,
};

export default function ExamDetail() {
  const itemData = useData(
    (state) => state.itemData
  ) as IEmployeeExamHistory | null;
  const { colors } = useTheme();
  const layout = useWindowDimensions();

  const routes = [
    { key: "examinee-general-info", title: "Thí Sinh" },
    { key: "exam-info", title: "Đợt Thi" },
    ...(itemData?.exam.examType.hasTopic
      ? [{ key: "topic", title: "Đề Tài" }]
      : []),
    ...(itemData?.exam.examType.hasTraining
      ? [{ key: "education", title: "Kết Quả Đào Tạo" }]
      : []),
    { key: "scores", title: "Điểm" },
  ];

  const { tab } = useLocalSearchParams();
  const initialIndex =
    tab && typeof tab === "string"
      ? routes.findIndex((r) => r.key === tab)
      : -1;
  const [index, setIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const insets = useSafeAreaInsets();

  const renderScene = ({
    route,
  }: {
    route: { key: string; title: string };
  }) => {
    const Component = (mapComponent as any)[route.key];
    return <Component />;
  };
  const LazyPlaceholder = useMemo(() => {
    return <LoadingScreen />;
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        marginBottom: insets.bottom,
      }}
    >
      <AppHeader
        title={itemData?.exam.name ?? "Chi tiết kỳ thi"}
        subtitle="Chi tiết thi"
        onBack={() => router.back()}
        bottom={
          <DetailTabBar
            data={routes.map((route) => ({
              id: route.key,
              value: route.title,
            }))}
            value={routes[index]?.key}
            onChange={(value) =>
              setIndex(routes.findIndex((route) => route.key === value.id))
            }
          />
        }
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        lazy
        renderLazyPlaceholder={() => LazyPlaceholder}
        renderTabBar={() => null}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}
