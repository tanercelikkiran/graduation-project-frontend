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
import type { PyramidExpandOptions } from "@/types/pyramid";

export default function ExpandPage() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden during pyramid expand exercise
  useNavigationBar();

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
  } = usePyramid();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Helper function to determine if text is short
  const isShortText = useCallback((text: string) => text.length <= 50, []);

  // Function to get sentence from expand option
  const getOptionSentence = useCallback((option: PyramidExpandOptions) => {
    return option.sentence;
  }, []);

  // Function to get affected words for TTS (the expand word)
  const getAffectedWords = useCallback((option: PyramidExpandOptions) => {
    return [option.expand_word];
  }, []);

  // Render individual expand option
  const renderOption = useCallback(
    (option: PyramidExpandOptions, index: number, isSelected: boolean, onPress?: () => void) => {
      if (!option) {
        console.error(
          `ExpandPage: renderOption - Option at index ${index} is undefined.`
        );
        return null;
      }
      if (typeof option.sentence !== "string") {
        console.error(
          `ExpandPage: renderOption - option.sentence is not a string for option at index ${index}. Value:`,
          option.sentence,
          "Full option:",
          option
        );
      }
      if (typeof option.expand_word !== "string") {
        console.warn(
          `ExpandPage: renderOption - option.expand_word is not a string for option at index ${index}. Value:`,
          option.expand_word,
          "Full option:",
          option
        );
      }

      const parts = option.sentence.split(option.expand_word);
      const isShortSentence = isShortText(option.sentence);

      return (
        <TouchableOpacity
          key={index}
          style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
          onPress={onPress || (() => selectOption(index))}
        >
          <View
            style={[
              styles.expandedSentenceContainer,
              isShortSentence
                ? styles.centerAlignment
                : styles.distributedAlignment,
            ]}
          >
            {parts.length > 0 && (
              <Text style={styles.expandedSentence}>{parts[0]}</Text>
            )}
            <Text style={styles.highlightedWord}>{option.expand_word}</Text>
            {parts.length > 1 && (
              <Text style={styles.expandedSentence}>{parts[1]}</Text>
            )}
          </View>
          <Text style={styles.meaning}>{option.meaning}</Text>
        </TouchableOpacity>
      );
    },
    [theme, horizontalScale, verticalScale, isShortText, selectOption]
  );

  const params = useLocalSearchParams();

  const pyramidIdFromParams = Array.isArray(params.pyramidId)
    ? params.pyramidId[0]
    : params.pyramidId;

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

  return (
    <BasePyramidPage<PyramidExpandOptions>
      pyramidData={pyramidData}
      loading={loading}
      error={error}
      selectedOption={selectedOption}
      renderOption={renderOption}
      onOptionSelect={selectOption}
      getOptionSentence={getOptionSentence}
      getAffectedWords={getAffectedWords}
      onContinue={submitSelection}
      isLastStep={isLastStep}
      creatingNextStep={creatingNextStep}
      transitioning={transitioning}
      transformationType="expand"
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
    expandedSentenceContainer: {
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
    expandedSentence: {
      fontSize: horizontalScale(18),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      lineHeight: verticalScale(28),
      flexShrink: 1,
      textAlign: "center",
    },
    highlightedWord: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlueColor
          : lightTheme.surfaceBlueColor,
      borderRadius: horizontalScale(4),
      lineHeight: verticalScale(28),
      height: verticalScale(28),
      alignSelf: "center",
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
