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
    title: "Nhân viên",
    focusedIcon: "account-check",
    unfocusedIcon: "account-check-outline",
  },
  {
    key: "exam",
    title: "Kỳ thi",
    focusedIcon: "trophy-variant",
    unfocusedIcon: "trophy-variant-outline",
  },
  {
    key: "manage-training",
    title: "Đào tạo",
    focusedIcon: "book-open-page-variant",
    unfocusedIcon: "book-open-page-variant-outline",
  },
];
export default function TabLayout() {
  const index = useTab((state) => state.index);
  const setIndex = useTab((state) => state.setIndex);
  const { colors } = useTheme();
  const routes = React.useMemo<BottomNavigationRoute[]>(() => routerBase, []);

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
