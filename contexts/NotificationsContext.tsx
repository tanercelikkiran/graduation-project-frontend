import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationsContextType {
  announcementsEnabled: boolean;
  remindersEnabled: boolean;
  toggleAnnouncements: () => void;
  toggleReminders: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}

export default function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announcementsEnabled, setAnnouncementsEnabled] = useState<boolean>(true);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(true);

  // Load notification preferences from AsyncStorage when component mounts
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        // Load announcements preference
        const announcementsPref = await AsyncStorage.getItem("announcementsEnabled");
        if (announcementsPref !== null) {
          setAnnouncementsEnabled(announcementsPref === "true");
        }

        // Load reminders preference
        const remindersPref = await AsyncStorage.getItem("remindersEnabled");
        if (remindersPref !== null) {
          setRemindersEnabled(remindersPref === "true");
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    };
    
    loadNotificationPreferences();
  }, []);

  // Toggle announcements notifications
  const toggleAnnouncements = async () => {
    try {
      const newValue = !announcementsEnabled;
      setAnnouncementsEnabled(newValue);
      await AsyncStorage.setItem("announcementsEnabled", String(newValue));
    } catch (error) {
      console.error("Error saving announcements preference:", error);
    }
  };

  // Toggle reminders notifications
  const toggleReminders = async () => {
    try {
      const newValue = !remindersEnabled;
      setRemindersEnabled(newValue);
      await AsyncStorage.setItem("remindersEnabled", String(newValue));
    } catch (error) {
      console.error("Error saving reminders preference:", error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        announcementsEnabled,
        remindersEnabled,
        toggleAnnouncements,
        toggleReminders
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}