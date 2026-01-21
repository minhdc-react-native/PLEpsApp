import { createContext, useContext } from "react";

export interface NotificationContextValue {
  fetchNotificationCount: () => Promise<void>;
}

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
