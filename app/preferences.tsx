import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useScale } from "@/hooks/useScale";

import CloseButton from "@/components/CloseButton";
import PreferenceItem from "@/components/PreferenceItem";
import LanguageSelectionModal from "@/components/LanguageSelectionModal";
import { useAuth } from "@/contexts/AuthenticationContext";
import axios from "axios";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function PreferencesScreen() {
  // Ensure navigation bar stays hidden in preferences
  useNavigationBar();

  const { theme, toggleTheme } = useTheme();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const { token } = useAuth();

  const {
    vibrationEnabled,
    soundEffectsEnabled,
    toggleVibration,
    toggleSoundEffects,
  } = usePreferences();
  const { interfaceLanguage, setInterfaceLanguage, interfaceLanguageOptions } =
    useLanguage();
  const { t } = useTranslation();
  const router = useRouter();

  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const showLanguageModal = () => {
    setIsLanguageModalVisible(true);
  };

  const hideLanguageModal = () => {
    setIsLanguageModalVisible(false);
  };

  const handleLanguageSelection = (language: string) => {
    setInterfaceLanguage(language);
    const response = axios.put(
      `${apiUrl}/user/update`,
      {
        system_language: language,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Preferences title on left and X button on right */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("preferences.title")}</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <PreferenceItem
          title={t("preferences.vibrationFeedback")}
          showSwitch={true}
          value={vibrationEnabled}
          onValueChange={toggleVibration}
        />

        <PreferenceItem
          title={t("preferences.soundEffects")}
          showSwitch={true}
          value={soundEffectsEnabled}
          onValueChange={toggleSoundEffects}
        />

        <PreferenceItem
          title={t("preferences.darkTheme")}
          showSwitch={true}
          value={theme === "dark"}
          onValueChange={toggleTheme}
        />

        <PreferenceItem
          title={t("preferences.interfaceLanguage")}
          rightText={
            interfaceLanguageOptions.find(
              (lang) => lang.displayName === interfaceLanguage
            )?.nativeName || interfaceLanguage
          }
          showChevron={true}
          onPress={showLanguageModal}
        />
      </ScrollView>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        visible={isLanguageModalVisible}
        onClose={hideLanguageModal}
        languages={interfaceLanguageOptions}
        selectedLanguage={interfaceLanguage}
        onSelectLanguage={handleLanguageSelection}
      />
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
