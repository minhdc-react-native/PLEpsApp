import { Stack } from "expo-router";

export default function TrainingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="session-detail" options={{ headerShown: false }} />
      <Stack.Screen name="exam-session" options={{ headerShown: false }} />
    </Stack>
  );
}
