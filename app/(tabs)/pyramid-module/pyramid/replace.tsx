import React, { useCallback, useEffect } from "react";
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
import type { PyramidReplaceOptions } from "@/types/pyramid";

import ShortArrowRightLight from "@/assets/icons/Short Arrow Right Light.svg";
import ShortArrowRightDark from "@/assets/icons/Short Arrow Right Dark.svg";

export default function ReplacePage() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const {
    pyramidData,
    loading,
    error,
    selectedOption,
    selectOption,
    submitSelection,
    isLastStep,
    loadPyramid,
    creatingNextStep,
    transitioning,
    previewData, // Artık hata vermeyecek
    fetchPreviewOptionsForCurrentStep,
    getCurrentStepItem,
  } = usePyramid();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Helper function to determine if text is short
  const isShortText = useCallback((text: string) => text.length <= 50, []);

  // Function to format the sentence with highlighted replaced word
  const formatSentenceWithReplacedWord = useCallback(
    (initialSentence: string, replacedWord: string, changedWord: string) => {
      if (typeof initialSentence !== "string") {
        console.error(
          `ReplacePage: formatSentenceWithReplacedWord - initialSentence is not a string. Value:`,
          initialSentence
        );
      }
      if (typeof replacedWord !== "string") {
        console.warn(
          `ReplacePage: formatSentenceWithReplacedWord - replacedWord is not a string. Value:`,
          replacedWord
        );
      }

      const parts = initialSentence.split(replacedWord);
      const isShortSentence = isShortText(initialSentence);

      if (parts.length > 1) {
        return (
          <View
            style={[
              styles.sentenceContainer,
              isShortSentence
                ? styles.centerAlignment
                : styles.distributedAlignment,
            ]}
          >
            <Text style={styles.replacedSentence}>{parts[0]}</Text>
            <View style={styles.replacementBox}>
              <Text style={styles.replacedWord}>{replacedWord}</Text>
              {theme === "dark" ? (
                <ShortArrowRightDark style={styles.arrowSymbol} />
              ) : (
                <ShortArrowRightLight style={styles.arrowSymbol} />
              )}
              <Text style={styles.changedWord}>{changedWord}</Text>
            </View>
            <Text style={styles.replacedSentence}>{parts[1]}</Text>
          </View>
        );
      }

      return initialSentence;
    },
    [theme, isShortText]
  );

  const renderOption = useCallback(
    (option: PyramidReplaceOptions, index: number, isSelected: boolean, onPress?: () => void) => {
      const currentStepItem = getCurrentStepItem();
      if (!currentStepItem) {
        console.error(
          `ReplacePage: renderOption - currentStepItem is null or undefined for option index ${index}.`
        );
      } else if (typeof currentStepItem.initial_sentence !== "string") {
        console.error(
          `ReplacePage: renderOption - currentStepItem.initial_sentence is not a string for option index ${index}. Value:`,
          currentStepItem.initial_sentence,
          "Full currentStepItem:",
          currentStepItem
        );
      }
      if (!option) {
        console.error(
          `ReplacePage: renderOption - Option at index ${index} is undefined.`
        );
      } else {
        if (typeof option.replaced_word !== "string") {
          console.warn(
            `ReplacePage: renderOption - option.replaced_word is not a string for option index ${index}. Value:`,
            option.replaced_word,
            "Full option:",
            option
          );
        }
        if (typeof option.changed_word !== "string") {
          console.warn(
            `ReplacePage: renderOption - option.changed_word is not a string for option index ${index}. Value:`,
            option.changed_word,
            "Full option:",
            option
          );
        }
      }

      if (!currentStepItem) {
        return null;
      }

      return (
        <TouchableOpacity
          key={index}
          style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
          onPress={onPress || (() => selectOption(index))}
        >
          {formatSentenceWithReplacedWord(
            currentStepItem.initial_sentence,
            option.replaced_word,
            option.changed_word
          )}
          <Text style={styles.meaning}>{option.meaning}</Text>
        </TouchableOpacity>
      );
    },
    [theme, formatSentenceWithReplacedWord, getCurrentStepItem, selectOption]
  );

  const params = useLocalSearchParams();

  const pyramidIdFromParams = Array.isArray(params.pyramidId)
    ? params.pyramidId[0]
    : params.pyramidId;

  // Efekt 1: Piramidi Yükle (Sadece Gerekliyse)
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

  useEffect(() => {
    if (
      pyramidData &&
      pyramidData.id === pyramidIdFromParams &&
      !pyramidData.completed &&
      pyramidData.last_step < pyramidData.total_steps - 1 &&
      !creatingNextStep &&
      (!previewData ||
        previewData.pyramid_id !== pyramidData.id ||
        previewData.current_step !== pyramidData.last_step)
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

  // Ensure navigation bar stays hidden during pyramid replace exercise
  useNavigationBar();

  // Function to extract sentence text for TTS
  const getOptionSentence = useCallback((option: PyramidReplaceOptions) => {
    const currentStepItem = getCurrentStepItem();
    if (!currentStepItem) return "";
    
    // Create the sentence with the replacement for TTS
    return currentStepItem.initial_sentence.replace(option.replaced_word, option.changed_word);
  }, [getCurrentStepItem]);

  // Function to get affected words for TTS (the newly added word)
  const getAffectedWords = useCallback((option: PyramidReplaceOptions) => {
    return [option.changed_word];
  }, []);

  return (
    <BasePyramidPage<PyramidReplaceOptions>
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
      transformationType="replace"
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
      marginBottom: verticalScale(8),
      alignItems: "center",
      paddingHorizontal: horizontalScale(8),
    },
    centerAlignment: {
      justifyContent: "center",
    },
    distributedAlignment: {
      justifyContent: "center",
    },
    replacedSentence: {
      fontSize: horizontalScale(18),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      lineHeight: verticalScale(28),
      flexShrink: 1,
      textAlign: "center",
    },
    replacementBox: {
      flexDirection: "row",
      borderRadius: horizontalScale(4),
      height: verticalScale(28),
      alignItems: "center",
    },
    replacedWord: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      lineHeight: verticalScale(28),
    },
    arrowSymbol: {
      marginHorizontal: horizontalScale(4),
    },
    changedWord: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      lineHeight: verticalScale(28),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlueColor
          : lightTheme.surfaceBlueColor,
      borderRadius: horizontalScale(4),
      paddingHorizontal: horizontalScale(2),
      paddingVertical: 0,
      marginHorizontal: horizontalScale(1),
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
