import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useProgress } from "@/contexts/ProgressContext";
import { useVocabularyList } from "@/hooks/useVocabularyList";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useScale } from "@/hooks/useScale";
import axios from "axios";

export default function SplashScreen() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);
  const { t } = useTranslation();
  const { token } = useAuth();
  const { setTotalSteps, setCurrentStep } = useProgress();
  const params = useLocalSearchParams();
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");
  const [eventId, setEventId] = useState<string | null>(null);

  // Get vocabulary list ID and rework flag from params
  const vocabularyListId = params.vocabularyListId as string;
  const isRework = params.rework === "true";
  console.log("[Debug] Quiz index loading with params:", {
    vocabularyListId,
    isRework,
  });

  console.log("[Debug] Current state:", {
    vocabularyListId,
    extractedVocabListId: "will be set after useVocabularyList call",
    effectiveVocabListId: "will be calculated after useVocabularyList call",
  });
  const {
    vocabularyList,
    vocabularyListId: extractedVocabListId,
    loading,
    error,
    fetchWordList,
  } = useVocabularyList(vocabularyListId, isRework);
  // Use extracted vocabulary list ID if the original one was not provided
  const effectiveVocabListId = vocabularyListId || extractedVocabListId;

  console.log("[Debug] Effective vocabulary list ID calculation:", {
    vocabularyListId,
    extractedVocabListId,
    effectiveVocabListId,
  });
  // Check for existing event when component loads
  useEffect(() => {
    const checkForExistingEvent = async () => {
      if (!token || !effectiveVocabListId) {
        console.log(
          "No token or effective vocabulary list ID available, skipping event check"
        );
        return;
      }

      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const response = await axios.get(
          `${apiUrl}/vocabulary/event/${effectiveVocabListId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (
          response.data &&
          response.data.status === "success" &&
          response.data.event?._id
        ) {
          console.log("[Debug] Found existing event:", response.data.event._id);
          setEventId(response.data.event._id);
        }
      } catch (error) {
        console.error("[Debug] Error checking for existing event:", error);
        // We don't need to do anything here - if there's no event, one will be created later
      }
    };

    checkForExistingEvent();
  }, [token, effectiveVocabListId]);
  // Add debug information updates
  useEffect(() => {
    const status = {
      loading,
      listLength: vocabularyList?.length || 0,
      hasError: !!error,
      errorMessage: error?.message,
      isRework,
      vocabularyListId,
      effectiveVocabListId,
      eventId,
    };

    console.log("[Debug] Quiz state updated:", status);
    setDebugInfo(JSON.stringify(status, null, 2));

    if (!loading) {
      console.log("[Debug] Complete vocabulary list:", vocabularyList);
    }
  }, [
    loading,
    vocabularyList,
    error,
    isRework,
    vocabularyListId,
    effectiveVocabListId,
    eventId,
  ]);
  // Separate effect for handling navigation to avoid race conditions
  useEffect(() => {
    // Only navigate when we have a valid vocabulary list, it's not empty, and we have an effective vocabulary list ID
    if (
      !loading &&
      vocabularyList &&
      vocabularyList.length > 0 &&
      effectiveVocabListId
    ) {
      console.log(
        "[Debug] Ready to navigate with vocabulary list length:",
        vocabularyList.length,
        "and effective vocabulary list ID:",
        effectiveVocabListId
      );

      // Set the progress context
      setTotalSteps(vocabularyList.length);
      setCurrentStep(0);

      const encodedWords = encodeURIComponent(JSON.stringify(vocabularyList)); // Use setTimeout to ensure state is fully updated before navigation
      setTimeout(() => {
        console.log(
          "[Debug] Navigating to question screen now with eventId:",
          eventId
        );
        router.replace({
          pathname: "./quiz/question",
          params: {
            wordList: encodedWords,
            stepIndex: 0,
            vocabularyListId: effectiveVocabListId,
            eventId: eventId || undefined, // Pass the event ID if we have one
          },
        });
      }, 300); // Slightly longer timeout to ensure everything is ready
    }
  }, [
    loading,
    vocabularyList,
    effectiveVocabListId,
    eventId,
    setTotalSteps,
    setCurrentStep,
  ]);

  // Separate effect for handling empty vocabulary lists or errors
  useEffect(() => {
    if (!loading && (!vocabularyList || vocabularyList.length === 0)) {
      console.log(
        "[Debug] Vocabulary list is empty or invalid after loading completed"
      );

      // If this is a rework, try to fetch one more time manually after a short delay
      if (isRework) {
        const retryTimer = setTimeout(() => {
          console.log("[Debug] Manually retrying fetch for rework");
          fetchWordList();
        }, 2000);

        return () => clearTimeout(retryTimer);
      }
    }
  }, [loading, vocabularyList, isRework, fetchWordList]);

  // Manual retry function
  const forceRetry = () => {
    console.log("[Debug] Forcing manual retry");
    fetchWordList();
  };

  // If loading is taking too long (more than 15 seconds), show the debug info
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log(
          "[Debug] Loading timeout reached, still waiting for response"
        );
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Display loading text appropriate to the action being performed
  const loadingText = isRework
    ? t("modules.vocabulary.quiz.creatingRework")
    : t("modules.vocabulary.quiz.creating");

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>{t("modules.vocabulary.quiz.error")}</Text>
        <Text style={styles.debugText}>
          {typeof error.message === "string"
            ? error.message
            : t("modules.vocabulary.quiz.unknownError")}
        </Text>
        <TouchableOpacity onPress={forceRetry}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        {loading ? loadingText : t("modules.vocabulary.quiz.completed")}
      </Text>
      <ActivityIndicator
        size="small"
        color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        style={styles.loader}
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
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    loader: {
      marginTop: verticalScale(20),
    },
    header: {
      fontSize: horizontalScale(24),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Semibold",
      marginBottom: verticalScale(20),
      textAlign: "center",
    },
    debugContainer: {
      marginTop: verticalScale(50),
      padding: horizontalScale(10),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.cardBackgroundColor,
      borderRadius: horizontalScale(8),
      width: "80%",
    },
    debugTitle: {
      fontSize: horizontalScale(16),
      fontWeight: "bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(10),
    },
    debugText: {
      fontSize: horizontalScale(12),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    retryText: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color:
        theme === "dark" ? darkTheme.primaryColor : lightTheme.primaryColor,
      marginTop: verticalScale(20),
      textAlign: "center",
    },
  });
