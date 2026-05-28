import LoadingScreen from "@/components/loading-screen";
import VcSelector from "@/components/vcSelector";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import { router, useLocalSearchParams } from "expo-router";

import { useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { Appbar, Divider, useTheme } from "react-native-paper";
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
        gap: 10,
        backgroundColor: colors.background,
        marginBottom: insets.bottom,
      }}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={itemData?.exam.name} />
      </Appbar.Header>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        lazy
        renderLazyPlaceholder={() => LazyPlaceholder}
        renderTabBar={(pros: any) => (
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
              mode="full"
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
