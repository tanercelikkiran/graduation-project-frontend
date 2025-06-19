import React, { memo, useCallback } from "react";
import { View, StyleSheet, Alert, BackHandler } from "react-native";
import { Stack, useSegments, router, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";

import { ProgressProvider, useProgress } from "@/contexts/ProgressContext";
import CloseButton from "@/components/CloseButton";
import ProgressBar from "@/components/ProgressBar";
import { XPProvider } from "@/contexts/XPContext";

const QuizHeader = memo(function QuizHeader() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const { resetProgress } = useProgress();

  const handleQuit = useCallback(() => {
    Alert.alert(
      t("modules.vocabulary.quit.title"),
      t("modules.vocabulary.quit.message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("modules.vocabulary.quit.confirm"),
          style: "destructive",
          onPress: () => {
            resetProgress();
            router.replace("../(tabs)"); // Use replace to clear the stack
          },
        },
      ]
    );
  }, [resetProgress, t]);

  return (
    <View style={styles.container}>
      <CloseButton onPress={handleQuit} />
      <ProgressBar />
    </View>
  );
});

// Hardware back button handler
function BackButtonHandler() {
  const { resetProgress } = useProgress();
  const { t } = useTranslation();
  const segments = useSegments();
  const isInVocabularySession = segments.length >= 4 && segments[3] === "question";

  useFocusEffect(
    useCallback(() => {
      if (!isInVocabularySession) return;

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          Alert.alert(
            t("modules.vocabulary.quit.title"),
            t("modules.vocabulary.quit.message"),
            [
              {
                text: t("common.cancel"),
                style: "cancel",
              },
              {
                text: t("modules.vocabulary.quit.confirm"),
                style: "destructive",
                onPress: () => {
                  resetProgress();
                  router.replace("../(tabs)");
                },
              },
            ]
          );
          return true; // Prevent default back behavior
        }
      );

      return () => backHandler.remove();
    }, [isInVocabularySession, resetProgress, t])
  );

  return null;
}

function QuizLayout() {
  const segments = useSegments();

  // Index veya result sayfasında olup olmadığımızı kontrol et
  const isIndexPage =
    (segments.length === 3 && segments[2] === "quiz") ||
    (segments.length === 4 && segments[3] === "result");

  return (
    <XPProvider>
      <ProgressProvider>
        <BackButtonHandler />
        {!isIndexPage ? <QuizHeader /> : null}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="question" />
          <Stack.Screen name="result" />
        </Stack>
      </ProgressProvider>
    </XPProvider>
  );
}

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 5,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
      zIndex: -1,
    },
  });

// Memoize the component to prevent unnecessary re-renders
export default memo(QuizLayout);
