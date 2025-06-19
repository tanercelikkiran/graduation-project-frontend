import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import axios, { AxiosError } from "axios";
import { useScale } from "@/hooks/useScale";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

import LevelIllustrationLight from "@/assets/illustrations/Level Light.svg";
import LevelIllustrationDark from "@/assets/illustrations/Level Dark.svg";

import ReturnButton from "@/components/ReturnButton";
import LevelSelectionBottomSheet from "@/components/LevelSelectionBottomSheet";
import ButtonWithIcon from "@/components/ButtonWithIcon";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function LanguageLevelScreen() {
  const { token, refreshToken, logout } = useAuth();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const selectedLanguage = params.language as string;

  const [showLevels, setShowLevels] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Ensure navigation bar stays hidden during level selection
  useNavigationBar();

  // Function to open the level selection popup
  const openLevels = (): void => {
    setShowLevels(true);
  };

  // Function to close the level selection popup
  const closeLevels = (): void => {
    setShowLevels(false);
  };

  // Function to select or deselect a language level
  const handleLevelSelect = (level: string): void => {
    setSelectedLevel((prevLevel) => (prevLevel === level ? null : level)); // Toggle selection
  };

  const levels = [
    t("userLevel.levels.a1"),
    t("userLevel.levels.a2"),
    t("userLevel.levels.b1"),
    t("userLevel.levels.b2"),
    t("userLevel.levels.c1"),
  ];

  const handleContinue = async (level: string) => {
    closeLevels();
    setIsUpdating(true);

    try {
      if (!token) {
        throw new Error("Authentication required");
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.put(
        `${apiUrl}/user/update`,
        {
          level: level,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("User level updated:", response.data);

      router.navigate({
        pathname: "/user-purpose",
        params: {
          language: selectedLanguage,
        },
      });
    } catch (error) {
      const apiError = error as AxiosError;
      if (apiError.response && apiError.response.status === 401) {
        try {
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the request
            if (!token) {
              throw new Error("Authentication required");
            }

            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            const response = await axios.put(
              `${apiUrl}/user/update`,
              {
                level: level,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("User level updated:", response.data);

            router.navigate({
              pathname: "/user-purpose",
              params: {
                language: selectedLanguage,
              },
            });
          } else {
            // Logout or show warning
            await logout();
          }
        } catch (refreshErr) {
          // Show a new warning or logout
          Alert.alert(
            t("userLevel.updateErrorTitle"),
            t("userLevel.updateError")
          );
        }
        console.error("Error updating user level:", apiError);
        Alert.alert(
          t("userLevel.updateErrorTitle"),
          t("userLevel.updateError")
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button to navigate to the previous screen */}
      <ReturnButton />

      {/* Header text */}
      <Text style={styles.header}>{t("userLevel.title")}</Text>

      {/* Illustration */}
      {theme === "dark" ? (
        <LevelIllustrationDark
          width={horizontalScale(400)}
          height={verticalScale(400)}
        />
      ) : (
        <LevelIllustrationLight
          width={horizontalScale(400)}
          height={verticalScale(400)}
        />
      )}

      {/* Button to open level selection popup */}
      <ButtonWithIcon
        title={t("userLevel.selectLevel")}
        icon="chevron-up"
        onPress={openLevels}
        disabled={isUpdating}
      />

      {/* Button for a screening test */}
      <ButtonWithIcon
        title={t("userLevel.selectBeginner")}
        icon="flag-outline"
        onPress={() => handleContinue("A1 - Beginner")}
        disabled={isUpdating}
      />

      {/* Level selection popup */}
      <LevelSelectionBottomSheet
        visible={showLevels}
        onClose={closeLevels}
        levels={levels}
        selectedLevel={selectedLevel}
        onLevelSelect={handleLevelSelect}
        onConfirm={() => {
          handleContinue(selectedLevel || "A1 - Beginner");
        }}
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
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
      paddingTop: verticalScale(20),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    header: {
      fontSize: horizontalScale(20),
      fontFamily: "Medium",
      marginBottom: 20,
      alignSelf: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    levelOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: horizontalScale(15),
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(10),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    levelText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
  });
