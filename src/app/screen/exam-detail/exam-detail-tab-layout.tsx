import AppHeader from "@/components/app-header";
import DetailTabBar from "@/components/detail-tab-bar";
import LoadingScreen from "@/components/loading-screen";
import { IExam } from "@/types/exam/exam.model";
import { router } from "expo-router";
import { ComponentType, useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { TabView } from "react-native-tab-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExamDetailEducationInfo from "./education";
import ExamDetailExamInfo from "./exam-info";
import ExamDetailExamineeGeneralInfo from "./examinee-general-info";
import ExamDetailScoresInfo from "./scores";
import ExamDetailTopicInfo from "./topic";

type ExamDetailTabKey =
  | "overview"
  | "examinee-general-info"
  | "exam-info"
  | "topic"
  | "education"
  | "scores";

const tabComponents: Partial<Record<ExamDetailTabKey, ComponentType>> = {
  "examinee-general-info": ExamDetailExamineeGeneralInfo,
  "exam-info": ExamDetailExamInfo,
  topic: ExamDetailTopicInfo,
  education: ExamDetailEducationInfo,
  scores: ExamDetailScoresInfo,
};

interface ExamDetailTabLayoutProps {
  exam: IExam;
  initialTab?: string;
  overview?: ComponentType;
}

export default function ExamDetailTabLayout({
  exam,
  initialTab,
  overview: Overview,
}: ExamDetailTabLayoutProps) {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const routes: { key: ExamDetailTabKey; title: string }[] = [
    ...(Overview ? [{ key: "overview" as const, title: "Theo dõi" }] : []),
    { key: "examinee-general-info", title: "Thí sinh" },
    { key: "exam-info", title: "Đợt thi" },
    ...(exam.examType.hasTopic ? [{ key: "topic" as const, title: "Đề tài" }] : []),
    ...(exam.examType.hasTraining
      ? [{ key: "education" as const, title: "Kết quả đào tạo" }]
      : []),
    { key: "scores", title: "Điểm" },
  ];

  const requestedIndex = initialTab
    ? routes.findIndex((route) => route.key === initialTab)
    : -1;
  const [index, setIndex] = useState(requestedIndex >= 0 ? requestedIndex : 0);

  const renderScene = ({ route }: { route: { key: ExamDetailTabKey } }) => {
    if (route.key === "overview" && Overview) return <Overview />;
    const Scene = tabComponents[route.key];
    return Scene ? <Scene /> : null;
  };

  const lazyPlaceholder = useMemo(() => <LoadingScreen />, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        marginBottom: insets.bottom,
      }}
    >
      <AppHeader
        title="Chi tiết kỳ thi"
        onBack={() => router.back()}
        bottom={
          <DetailTabBar
            data={routes.map((route) => ({ id: route.key, value: route.title }))}
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
        renderLazyPlaceholder={() => lazyPlaceholder}
        renderTabBar={() => null}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}
