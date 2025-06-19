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
import type { PyramidParaphOptions } from "@/types/pyramid";

export default function ParaphrasePage() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden during pyramid paraphrase exercise
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
    previewData,
    fetchPreviewOptionsForCurrentStep,
  } = usePyramid();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const renderOption = useCallback(
    (option: PyramidParaphOptions, index: number, isSelected: boolean, onPress?: () => void) => {
      const paraphrasedSentenceToShow = option.paraphrased_sentence || "";
      const meaningToShow = option.meaning || "Anlam mevcut değil";

      return (
        <TouchableOpacity
          key={index}
          style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
          onPress={onPress || (() => selectOption(index))}
        >
          <View style={styles.centerAlignment}>
            <Text style={styles.paraphrasedSentence}>
              {paraphrasedSentenceToShow}
            </Text>
          </View>
          <Text style={styles.meaning}>{meaningToShow}</Text>
        </TouchableOpacity>
      );
    },
    [theme, horizontalScale, verticalScale, selectOption]
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

  // Function to extract sentence text for TTS
  const getOptionSentence = useCallback((option: PyramidParaphOptions) => {
    return option.paraphrased_sentence || "";
  }, []);

  return (
    <BasePyramidPage<PyramidParaphOptions>
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
      transformationType="paraphrase"
      getOptionSentence={getOptionSentence}
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
    centerAlignment: {
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    paraphrasedSentence: {
      fontSize: horizontalScale(18),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      lineHeight: verticalScale(28),
      textAlign: "center",
      paddingHorizontal: horizontalScale(8),
      paddingVertical: verticalScale(4),
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
