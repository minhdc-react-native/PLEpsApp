import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification-detail"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="history-exams" options={{ headerShown: false }} />
        <Stack.Screen
          name="employee-profile"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="exam-detail" options={{ headerShown: false }} />
        <Stack.Screen name="guide-exam" options={{ headerShown: false }} />
        <Stack.Screen
          name="guide-exam-detail"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="employee-register-exam"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="postpone-exam" options={{ headerShown: false }} />
        <Stack.Screen name="register-topic" options={{ headerShown: false }} />
        <Stack.Screen
          name="register-topic-detail"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="contest-info" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="training" options={{ headerShown: false }} />
        <Stack.Screen name="current-exam" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
