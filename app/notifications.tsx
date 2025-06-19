import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";
import { useScale } from "@/hooks/useScale";
import CloseButton from "@/components/CloseButton";
import PreferenceItem from "@/components/PreferenceItem";
import { useRouter } from "expo-router";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const {
    announcementsEnabled,
    remindersEnabled,
    toggleAnnouncements,
    toggleReminders,
  } = useNotifications();
  const { t } = useTranslation();
  const router = useRouter();

  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Ensure navigation bar stays hidden in notifications
  useNavigationBar();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Notifications title on left and X button on right */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <PreferenceItem
          title={t("notifications.announcements")}
          showSwitch={true}
          value={announcementsEnabled}
          onValueChange={toggleAnnouncements}
        />

        <PreferenceItem
          title={t("notifications.reminders")}
          showSwitch={true}
          value={remindersEnabled}
          onValueChange={toggleReminders}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: horizontalScale(20),
      paddingTop: verticalScale(40),
      paddingBottom: verticalScale(10),
      borderBottomWidth: 1,
      borderBottomColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
    headerTitle: {
      fontSize: horizontalScale(20),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(24),
    },
  });
