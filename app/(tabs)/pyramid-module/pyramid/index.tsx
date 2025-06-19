import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { usePyramid } from "@/hooks/usePyramid";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function CreatePyramidScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const customSentence = params.customSentence as string | undefined;
  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden during pyramid creation
  useNavigationBar();

  const {
    pyramidData,
    loading,
    error,
    createPyramid,
    pyramidId,
    getCurrentStepItem,
  } = usePyramid();

  // Initialize pyramid creation
  useEffect(() => {
    const startSentence = customSentence || "";
    createPyramid(startSentence);
  }, [customSentence, createPyramid]);

  // Navigate to pyramid step page when data is loaded
  useEffect(() => {
    if (pyramidData && pyramidId && !loading && !error) {
      const currentStepItem = getCurrentStepItem();
      if (currentStepItem) {
        router.replace({
          pathname: `/(tabs)/pyramid-module/pyramid/${currentStepItem.step_type}`,
          params: { pyramidId },
        });
      }
    }
  }, [pyramidData, pyramidId, loading, error, getCurrentStepItem]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView
        style={styles(theme, horizontalScale, verticalScale).container}
      >
        <Text style={styles(theme, horizontalScale, verticalScale).header}>
          {t("modules.pyramid.loading")}
        </Text>
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
          style={styles(theme, horizontalScale, verticalScale).loader}
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView
        style={styles(theme, horizontalScale, verticalScale).container}
      >
        <Text style={styles(theme, horizontalScale, verticalScale).errorText}>
          {t("common.error")} {error}
        </Text>
      </SafeAreaView>
    );
  }

  // No data state
  if (!pyramidData) {
    return (
      <SafeAreaView
        style={styles(theme, horizontalScale, verticalScale).container}
      >
        <Text style={styles(theme, horizontalScale, verticalScale).header}>
          {t("modules.pyramid.noData")}
        </Text>
      </SafeAreaView>
    );
  }

  const currentStepItem = getCurrentStepItem();
  if (!currentStepItem) {
    return (
      <SafeAreaView
        style={styles(theme, horizontalScale, verticalScale).container}
      >
        <Text style={styles(theme, horizontalScale, verticalScale).header}>
          {t("modules.pyramid.loadingStepData")}
        </Text>
      </SafeAreaView>
    );
  }

  // Fallback display (should redirect before reaching here)
  return (
    <SafeAreaView
      style={styles(theme, horizontalScale, verticalScale).container}
    >
      <Text style={styles(theme, horizontalScale, verticalScale).header}>
        {t("modules.pyramid.redirecting")}
      </Text>
      <Text style={styles(theme, horizontalScale, verticalScale).sentenceText}>
        {currentStepItem.initial_sentence}
      </Text>
      <Text style={styles(theme, horizontalScale, verticalScale).meaningText}>
        {currentStepItem.initial_sentence_meaning}
      </Text>
    </SafeAreaView>
  );
}

const styles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
      padding: horizontalScale(20),
    },
    loader: {
      marginTop: verticalScale(20),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    header: {
      fontSize: horizontalScale(24),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(20),
      textAlign: "center",
    },
    errorText: {
      fontSize: horizontalScale(18),
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      textAlign: "center",
      fontFamily: "Regular",
    },
    sentenceText: {
      fontSize: horizontalScale(18),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Regular",
      textAlign: "center",
      marginHorizontal: 20,
      marginBottom: 10,
    },
    meaningText: {
      fontSize: horizontalScale(14),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Regular",
      textAlign: "center",
      marginHorizontal: 20,
      opacity: 0.7,
    },
  });
