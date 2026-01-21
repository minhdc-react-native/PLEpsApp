import { useNotification } from "@/hooks/useNotification";
import { useData } from "@/hooks/zustand/useData";
import { api } from "@/utils/epsApi";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import NotificationPopup from "./notificationPopup";

Notifications.setNotificationHandler({
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
    const registerForPush = async () => {
      if (!Device.isDevice) {
        alert("⚠️ Chỉ hoạt động trên thiết bị thật");
        return;
      }

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
      registerDeviceToken(fcmToken.data);
    };

    if (!user?.id) return;

    registerForPush();
    fetchNotificationCount();

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
