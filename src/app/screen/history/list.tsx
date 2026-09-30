import AppHeader from "@/components/app-header";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import ExamHistoryManagement from "./exam/exam-history-management";
import SalaryHistoryManagement from "./salary/salary-history-management";
import TrainingHistoryScreen from "../training/history";
import WorkHistoryManagement from "./work-history/work-history-management";
import ProjectHistoryManagement from "./project-history/project-history-management";
import CertificateHistoryManagement from "./certificate/certificate-history-management";
import SkillStandardManagement from "./skill-standard/skill-standard-management";
import HistoryMenu from "./index";

const historyPages = {
  salary: { title: "Quá trình hưởng lương", component: SalaryHistoryManagement },
  "work-history": { title: "Quá trình công tác", component: WorkHistoryManagement },
  "project-history": { title: "Quá trình tham gia công trình", component: ProjectHistoryManagement },
  exam: { title: "Quá trình thi", component: ExamHistoryManagement },
  training: { title: "Quá trình đào tạo", component: TrainingHistoryScreen },
  certificate: { title: "Chứng chỉ", component: CertificateHistoryManagement },
  "skill-standard": { title: "Tiêu chuẩn bậc thợ", component: SkillStandardManagement },
};

export default function HistoryListScreen() {
  const { colors } = useTheme();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const pageType = Array.isArray(type) ? type[0] : type;

  if (!pageType || !(pageType in historyPages)) return <HistoryMenu />;

  const page = historyPages[pageType as keyof typeof historyPages];
  const Page = page.component;

  if (pageType === "training") return <TrainingHistoryScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title={page.title} onBack={() => router.back()} />
      <Page />
    </View>
  );
}
