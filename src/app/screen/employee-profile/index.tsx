import LoadingScreen from "@/components/loading-screen";
import VcSelector from "@/components/vcSelector";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { Appbar, Divider, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabView } from "react-native-tab-view";
import EmployeeEducation from "./employee-education";
import EmployeeHistory from "./employee-history";
import EmployeeInfo from "./employee-info";
import EmployeeResume from "./employee-resume";
import EmployeeContract from "./empoyee-contract";
const mapComponent = {
  info: EmployeeInfo,
  resume: EmployeeResume,
  education: EmployeeEducation,
  contract: EmployeeContract,
  history: EmployeeHistory,
};
export default function EmployeeProfile() {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const routes = [
    { key: "info", title: "Thông tin cơ bản" },
    { key: "resume", title: "Lý lịch" },
    { key: "education", title: "Học vấn" },
    { key: "contract", title: "Hợp đồng" },
    { key: "history", title: "Khác" },
  ];

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
        <Appbar.Content title="Hồ sơ nhân viên" />
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
