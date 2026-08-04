import { theme } from "@/constants/Theme";
import { NotificationListener } from "@/providers/noti/notificationListener";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { RootSiblingParent } from "react-native-root-siblings";
import { LoadingProvider } from "../components/dialog/loadingProvider";
import { PopupProvider } from "../components/dialog/popupProvider";
import { NotificationProvider } from "../providers/NotificationProvider";
import { AuthProvider } from "./(auth)/AuthProvider";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootSiblingParent>
        <NotificationProvider>
          <NotificationListener />
          <PopupProvider>
            <LoadingProvider>
              <PaperProvider theme={theme}>
                <AuthProvider>
                  <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="screen"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </AuthProvider>
                <StatusBar
                  style="dark"
                />
              </PaperProvider>
            </LoadingProvider>
          </PopupProvider>
        </NotificationProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
}
