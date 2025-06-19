import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import { BasePyramidPage } from "@/components/BasePyramidPage";
import { usePyramid } from "@/hooks/usePyramid";
import type { PyramidShrinkOptions } from "@/types/pyramid";

export default function ShrinkPage() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden during pyramid shrink exercise
  useNavigationBar();

  const {
    pyramidData,
    loading,
    error,
    selectedOption,
    selectOption,
    submitSelection,
    isLastStep,
    getCurrentStepItem,
    loadPyramid,
    creatingNextStep,
    transitioning,
    previewData,
    fetchPreviewOptionsForCurrentStep,
  } = usePyramid();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // State for managing revealed words
  const [revealedWords, setRevealedWords] = useState<{
    [key: number]: boolean;
  }>({});

  // Helper function to determine if text is short
  const isShortText = useCallback((text: string) => text.length <= 50, []);

  // Function to find position of the removed word in the original sentence
  const findRemovedWordPosition = useCallback(
    (
      originalSentence: string,
      shortenedSentence: string,
      removedWord: string
    ) => {
      // --- DEBUG LINES START ---
      if (typeof originalSentence !== "string") {
        console.error(
          `ShrinkPage: findRemovedWordPosition - originalSentence is not a string. Value:`,
          originalSentence
        );
      }
      if (typeof shortenedSentence !== "string") {
        console.warn(
          `ShrinkPage: findRemovedWordPosition - shortenedSentence is not a string. Value:`,
          shortenedSentence
        );
      }
      // --- DEBUG LINES END ---
      const originalWords = originalSentence.split(" ");
      const shortenedWords = shortenedSentence.split(" ");
      let wordInsertIndex = 0;

      for (let i = 0; i < originalWords.length; i++) {
        if (
          i >= shortenedWords.length ||
          originalWords[i] !== shortenedWords[i]
        ) {
          wordInsertIndex = i;
          break;
        }
      }
      return wordInsertIndex;
    },
    []
  );

  // Function to toggle word visibility
  const toggleWordVisibility = useCallback((index: number) => {
    setRevealedWords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const renderOption = useCallback(
    (option: PyramidShrinkOptions, index: number, isSelected: boolean, onPress?: () => void) => {
      // --- DEBUG LINES START ---
      if (!option) {
        console.error(
          `ShrinkPage: renderOption - Option at index ${index} is undefined.`
        );
        return null;
      }
      if (typeof option.sentence !== "string") {
        console.error(
          `ShrinkPage: renderOption - option.sentence is not a string for option at index ${index}. Value:`,
          option.sentence,
          "Full option:",
          option
        );
      }
      if (typeof option.removed_word !== "string") {
        console.warn(
          `ShrinkPage: renderOption - option.removed_word is not a string for option at index ${index}. Value:`,
          option.removed_word,
          "Full option:",
          option
        );
      }
      const parts = option.sentence.split(" ");
      const isShortSentence = isShortText(option.sentence);
      const currentStepItem = getCurrentStepItem();

      if (!currentStepItem) {
        console.error(
          `ShrinkPage: renderOption - currentStepItem is null for findRemovedWordPosition, option index ${index}.`
        );
      } else if (typeof currentStepItem.initial_sentence !== "string") {
        console.error(
          `ShrinkPage: renderOption - currentStepItem.initial_sentence is not a string for findRemovedWordPosition. Value:`,
          currentStepItem.initial_sentence,
          "Full currentStepItem:",
          currentStepItem
        );
      }

      if (!currentStepItem) return null;

      const wordPosition = findRemovedWordPosition(
        currentStepItem.initial_sentence,
        option.sentence,
        option.removed_word
      );

      // Create a copy of words and insert a placeholder for the removed word
      const wordsWithPlaceholder = [...parts];
      wordsWithPlaceholder.splice(wordPosition, 0, "PLACEHOLDER");

      return (
        <TouchableOpacity
          key={index}
          style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
          onPress={onPress || (() => selectOption(index))}
        >
          <View
            style={[
              styles.sentenceContainer,
              isShortSentence
                ? styles.centerAlignment
                : styles.distributedAlignment,
            ]}
          >
            {wordsWithPlaceholder.map((word, wordIndex) => {
              if (word === "PLACEHOLDER") {
                return (
                  <TouchableOpacity
                    key={`placeholder-${wordIndex}`}
                    style={styles.removedWordBox}
                    onPress={() => toggleWordVisibility(index)}
                  >
                    <Text style={styles.removedWordText}>
                      {revealedWords[index] ? option.removed_word : " "}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return (
                <Text key={`word-${wordIndex}`} style={styles.shrunkSentence}>
                  {word}
                  {wordIndex < wordsWithPlaceholder.length - 1 ? " " : ""}
                </Text>
              );
            })}
          </View>
          <Text style={styles.meaning}>{option.meaning}</Text>
        </TouchableOpacity>
      );
    },
    [
      theme,
      revealedWords,
      toggleWordVisibility,
      findRemovedWordPosition,
      getCurrentStepItem,
      isShortText,
      selectOption,
    ]
  );

  const params = useLocalSearchParams();
  const pyramidIdFromParams = Array.isArray(params.pyramidId)
    ? params.pyramidId[0]
    : params.pyramidId;

  // Efekt 1: Piramidi Yükle (Sadece Gerekliyse: Doğrudan URL ile erişim veya ID değişimi)
  useEffect(() => {
    if (pyramidIdFromParams && typeof pyramidIdFromParams === "string") {
      if (
        !loading &&
        (!pyramidData || pyramidData.id !== pyramidIdFromParams)
      ) {
        loadPyramid(pyramidIdFromParams);
      }
    }
  }, [pyramidIdFromParams, loadPyramid, pyramidData, loading]);

  // Efekt 2: Önizleme Seçeneklerini Getir (Sadece Gerekliyse)
  useEffect(() => {
    if (
      pyramidData &&
      pyramidData.id === pyramidIdFromParams && // Bu sayfadaki piramit için mi?
      !pyramidData.completed &&
      pyramidData.last_step < pyramidData.total_steps - 1 && // Son seçenekli adımda mıyız?
      !creatingNextStep && // Zaten yüklenmiyor mu?
      (!previewData || // Henüz previewData yok mu?
        previewData.pyramid_id !== pyramidData.id || // Farklı piramidin preview'ı mı?
        previewData.current_step !== pyramidData.last_step) // Farklı adımın preview'ı mı?
    ) {
      fetchPreviewOptionsForCurrentStep();
    }
  }, [
    pyramidData,
    pyramidIdFromParams,
    previewData,
    creatingNextStep,
    fetchPreviewOptionsForCurrentStep,
  ]);

  // Function to extract sentence text for TTS
  const getOptionSentence = useCallback((option: PyramidShrinkOptions) => {
    return option.sentence;
  }, []);

  // Function to get affected words for TTS (the removed word)
  const getAffectedWords = useCallback((option: PyramidShrinkOptions) => {
    return [option.removed_word];
  }, []);

  return (
    <BasePyramidPage<PyramidShrinkOptions>
      pyramidData={pyramidData}
      loading={loading}
      error={error}
      selectedOption={selectedOption}
      renderOption={renderOption}
      onOptionSelect={selectOption}
      onContinue={submitSelection}
      isLastStep={isLastStep}
      creatingNextStep={creatingNextStep}
      transitioning={transitioning}
      transformationType="shrink"
      getOptionSentence={getOptionSentence}
      getAffectedWords={getAffectedWords}
    />
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    optionCard: {
      marginBottom: verticalScale(16),
      padding: horizontalScale(16),
      backgroundColor:
        theme === "dark"
          ? darkTheme.cardBackgroundColor
          : lightTheme.cardBackgroundColor,
      borderRadius: horizontalScale(12),
    },
    sentenceContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: verticalScale(8),
      alignItems: "center",
      width: "100%",
      paddingHorizontal: horizontalScale(8),
    },
    centerAlignment: {
      justifyContent: "center",
    },
    distributedAlignment: {
      justifyContent: "center",
    },
    shrunkSentence: {
      fontSize: horizontalScale(18),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      lineHeight: verticalScale(28),
      flexShrink: 1,
      textAlign: "center",
    },
    removedWordBox: {
      borderWidth: horizontalScale(0.5),
      borderColor:
        theme === "dark"
          ? darkTheme.bodySecondaryColor
          : lightTheme.bodySecondaryColor,
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlueColor
          : lightTheme.surfaceBlueColor,
      borderRadius: horizontalScale(4),
      paddingHorizontal: horizontalScale(6),
      paddingVertical: 0,
      marginHorizontal: horizontalScale(3),
      height: verticalScale(28),
      alignSelf: "baseline",
      justifyContent: "center",
      alignItems: "center",
      minWidth: horizontalScale(20),
    },
    removedWordText: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      lineHeight: verticalScale(28),
    },
    meaning: {
      fontSize: horizontalScale(14),
      fontStyle: "italic",
      textAlign: "center",
      marginTop: verticalScale(8),
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
    },
    selectedOptionCard: {
      borderWidth: horizontalScale(2),
      borderColor:
        theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor,
    },
  });
