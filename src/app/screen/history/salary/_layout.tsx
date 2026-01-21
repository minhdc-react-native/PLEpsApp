import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="salary-history-management"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="salary-history-detail"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
