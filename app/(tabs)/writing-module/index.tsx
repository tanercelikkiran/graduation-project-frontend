import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useRouter } from "expo-router";
import { useWritingQuestions } from "@/hooks/useWriting";

import SuggestedQuestion from "@/components/SuggestedQuestion";
import LevelSelection from "@/components/LevelSelection";
import RepeatDark from "@/assets/icons/Repeat Dark.svg";
import RepeatLight from "@/assets/icons/Repeat Light.svg";

export default function WritingMainScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const { token } = useAuth();
  const router = useRouter();
  const { availableLevels, fetchLevels } = useWritingQuestions();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Ensure navigation bar stays hidden in writing module
  useNavigationBar();

  // Load available levels for authenticated users
  useEffect(() => {
    if (token) {
      fetchLevels();
    }
  }, [token]);

  const onRefresh = async () => {
    if (token) {
      await fetchLevels();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.header}>{t("modules.writing.title")}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          {theme === "dark" ? <RepeatDark /> : <RepeatLight />}
        </TouchableOpacity>
      </View>

      {/* Suggested Question Section */}
      <View style={styles.suggestedContainer}>
        <Text style={styles.suggestedHeader}>
          {t("modules.writing.suggested")}
        </Text>
        <SuggestedQuestion />
      </View>

      {/* Level Selection Section */}
      <View style={styles.levelContainer}>
        <Text style={styles.suggestedHeader}>
          {t("modules.writing.levels")}
        </Text>
        <LevelSelection />
      </View>
    </SafeAreaView>
  );
}

// Styles
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
    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: horizontalScale(24),
      marginTop: verticalScale(24),
      marginBottom: verticalScale(16),
    },
    header: {
      fontSize: horizontalScale(24),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    refreshButton: {
      padding: horizontalScale(8),
      borderRadius: horizontalScale(8),
    },
    suggestedContainer: {
      paddingHorizontal: horizontalScale(24),
      marginBottom: verticalScale(16),
    },
    suggestedHeader: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(8),
    },
    levelContainer: {
      paddingHorizontal: horizontalScale(24),
      marginBottom: verticalScale(16),
    },
  });
