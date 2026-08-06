import { useData } from "@/hooks/zustand/useData";
import { useTab } from "@/hooks/zustand/useTab";
import React from "react";
import { StyleSheet } from "react-native";
import {
  BottomNavigation,
  type BottomNavigationRoute,
  useTheme,
} from "react-native-paper";
import EmployeeInfo from ".";
import CurrentExamPage from "./exam";
import ManageTraining from "./manage-training";
const routerBase = [
  {
    key: "index",
    title: "Nhân Viên",
    focusedIcon: "account-check",
    unfocusedIcon: "account-check-outline",
  },
  {
    key: "exam",
    title: "Kỳ Thi",
    focusedIcon: "trophy-variant",
    unfocusedIcon: "trophy-variant-outline",
  },
  {
    key: "manage-training",
    title: "Đào Tạo",
    focusedIcon: "book-open-page-variant",
    unfocusedIcon: "book-open-page-variant-outline",
  },
];
export default function TabLayout() {
  const index = useTab((state) => state.index);
  const setIndex = useTab((state) => state.setIndex);
  const currentExam = useData((state) => state.currentExam);
  const { colors } = useTheme();
  const routes = React.useMemo<BottomNavigationRoute[]>(
    () =>
      routerBase.map((el) =>
        el.key === "exam"
          ? { ...el, badge: currentExam ? "1" : undefined }
          : el
      ),
    [currentExam]
  );

  const renderScene = BottomNavigation.SceneMap({
    index: EmployeeInfo,
    exam: CurrentExamPage,
    "manage-training": ManageTraining,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      activeColor={colors.primary}
      inactiveColor={colors.onSurfaceVariant}
      barStyle={styles.bar}
      labeled
      shifting={false}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
});
