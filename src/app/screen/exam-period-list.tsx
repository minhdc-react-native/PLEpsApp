import AppHeader from "@/components/app-header";
import ExamPeriodListScreen, {
  type ExamPeriodListType,
} from "@/components/exam/exam-period-list-screen";
import ExamHistoryManagement from "@/app/screen/history/exam/exam-history-management";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

export default function ExamPeriodListRoute() {
  const { colors } = useTheme();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const menuType = Array.isArray(type) ? type[0] : type;

  if (menuType === "all") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader title="Quá trình thi" onBack={() => router.back()} />
        <ExamHistoryManagement />
      </View>
    );
  }

  const listType: ExamPeriodListType =
    menuType === "registration" ? "registration" : "participating";

  return <ExamPeriodListScreen type={listType} />;
}
