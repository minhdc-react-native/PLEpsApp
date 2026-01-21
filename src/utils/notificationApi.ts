import { Platform } from "react-native";
import { api } from "./epsApi";

// API để gửi device token lên backend
export const registerDeviceToken = async (token: string): Promise<boolean> => {
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
