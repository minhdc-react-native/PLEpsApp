import { useNotification } from "@/hooks/useNotification";
import { useData } from "@/hooks/zustand/useData";
import { api } from "@/utils/epsApi";
import { isRunningInExpoGo } from "expo";
import * as Device from "expo-device";
import type * as NotificationsModule from "expo-notifications";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import NotificationPopup from "./notificationPopup";

const isExpoGoAndroid =
  Platform.OS === "android" &&
  isRunningInExpoGo();

// expo-notifications initializes a push-token listener at module scope. That
// initialization throws in Expo Go Android, so do not import it in that runtime.
const Notifications: typeof NotificationsModule | null = isExpoGoAndroid
  ? null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  : require("expo-notifications");

Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationListener() {
  const user = useData((s) => s.user);
  const { fetchNotificationCount } = useNotification();
  const [show, setShow] = useState(false);

  const [dataNotify, setDataNotify] = useState<{
    title: string | null;
    body: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    fetchNotificationCount();

    // Expo Go Android does not load expo-notifications at all. The app can
    // still debug all other screens and API flows without remote push.
    if (!Notifications) return;

    const registerForPush = async () => {
      if (!Device.isDevice) {
        alert("⚠️ Chỉ hoạt động trên thiết bị thật");
        return;
      }

      try {
        const { status } = await Notifications.getPermissionsAsync();
        let finalStatus = status;
        if (status !== "granted") {
          const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
          finalStatus = newStatus;
        }

        if (finalStatus !== "granted") {
          alert("🚫 Không có quyền nhận thông báo.");
          return;
        }

        const fcmToken = await Notifications.getDevicePushTokenAsync();
        console.log("🔑 FCM Token:", fcmToken.data);
        await registerDeviceToken(fcmToken.data);
      } catch (error) {
        console.error("Unable to register remote push token:", error);
      }
    };

    registerForPush();

    const foreground = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content;
        fetchNotificationCount();
        setDataNotify(data);
        setShow(true);
      }
    );

    const response = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👉 Clicked Notification:", response);
        // router.push('/notifications');
        // dispatch(setNotification({ intentPath: '/notifications' }));
      }
    );

    return () => {
      foreground.remove();
      response.remove();
    };
  }, [user?.id, fetchNotificationCount]);

  return show ? (
    <NotificationPopup
      title={dataNotify?.title}
      message={dataNotify?.body}
      onHide={() => setShow(false)}
    />
  ) : null;
}

const registerDeviceToken = async (token: string): Promise<boolean> => {
  try {
    const platform = Platform.OS === "ios" ? "ios" : "android";

    await api.post({
      link: "/notifications/device-token",
      data: {
        token,
        platform,
      },
      callBack: (res) => {
        console.log("Device token registered successfully:", res);
      },
      callError: (error: any) => {
        console.error("Failed to register device token:", error);
        throw error;
      },
    });

    return true;
  } catch (error) {
    console.error("Error registering device token:", error);
    return false;
  }
};
