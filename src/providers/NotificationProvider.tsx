import {
  NotificationContext,
  NotificationContextValue,
} from "@/hooks/useNotification";

import { useData } from "@/hooks/zustand/useData";
import { api } from "@/utils/epsApi";
import React, { ReactNode, useCallback } from "react";

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const setTotalUnread = useData((state) => state.setTotalUnread);

  // Initialize Firebase notification listeners

  // FETCH UNREAD COUNT
  const fetchNotificationCount = useCallback(async () => {
    try {
      await api.get({
        link: "/notifications/global",
        callBack: (res) => setTotalUnread(res.TotalUnread || 0),
        callError: (e) => console.error("Notification count error:", e),
      });
    } catch (e) {
      console.error("fetchNotificationCount error:", e);
    }
  }, [setTotalUnread]);

  const contextValue: NotificationContextValue = {
    fetchNotificationCount,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
