import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useScale } from "@/hooks/useScale";
import CloseButton from "@/components/CloseButton";
import SettingsItem from "@/components/SettingsItem";
import DialogModal from "@/components/DialogModal";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden in settings
  useNavigationBar();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handleLogoutPress = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with close button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.account")}</Text>

          <SettingsItem
            title={t("settings.items.preferences")}
            onPress={() => router.push("/preferences")}
          />
          <SettingsItem
            title={t("settings.items.profile")}
            onPress={() => router.push("/profile")}
          />
          <SettingsItem
            title={t("settings.items.notifications")}
            onPress={() => router.push("/notifications")}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support")}</Text>

          <SettingsItem
            title={t("settings.items.helpCenter")}
            onPress={() => router.push("/help")}
          />
          <SettingsItem
            title={t("settings.items.feedback")}
            onPress={() => router.push("/feedback")}
          />
        </View>

        {/* Log out */}
        <SettingsItem
          title={t("settings.items.logout")}
          onPress={handleLogoutPress}
          showChevron={false}
          isLogout={true}
        />

        {/* Version info */}
        <Text style={styles.versionText}>V1.0</Text>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <DialogModal
        visible={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        title={t("logout.confirmTitle")}
        message={t("logout.confirmMessage")}
        isConfirmation={true}
        confirmButtonText={t("logout.confirmButton")}
        cancelButtonText={t("logout.cancelButton")}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirmation(false)}
        destructiveConfirm={true}
      />
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) => {
  return StyleSheet.create({
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
      paddingBottom: verticalScale(24),
    },
    section: {
      marginBottom: verticalScale(20),
    },
    sectionTitle: {
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      marginVertical: verticalScale(8),
      marginLeft: horizontalScale(4),
    },
    versionText: {
      textAlign: "center",
      fontSize: horizontalScale(12),
      fontFamily: "Regular",
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      marginTop: verticalScale(16),
    },
  });
};
