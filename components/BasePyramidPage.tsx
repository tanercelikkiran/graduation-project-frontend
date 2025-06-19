import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import PrimaryButton from "@/components/PrimaryButton";
import { BookmarkButton } from "@/components/BookmarkButton";
import PyramidSentenceWithTTS, { stopCurrentSpeech } from "@/components/PyramidSentenceWithTTS";
import type { PyramidOut, PyramidOptionConcreteTypes } from "@/types/pyramid";
import { router, usePathname } from "expo-router";
import { useScale } from "@/hooks/useScale";
import {
  useSavedSentences,
  SaveSentenceRequest,
} from "@/contexts/SavedSentencesContext";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Değişiklik: Generic kısıtlama T extends PyramidOptionConcreteTypes olarak güncellendi
interface BasePyramidPageProps<T extends PyramidOptionConcreteTypes> {
  pyramidData: PyramidOut | null;
  loading: boolean;
  error: string | null;
  selectedOption: number | null;
  renderOption: (
    option: T,
    index: number,
    isSelected: boolean,
    onPress?: () => void
  ) => React.ReactNode;
  onOptionSelect: (optionIndex: number) => void;
  getOptionSentence?: (option: T) => string;
  getAffectedWords?: (option: T) => string[];
  onContinue: () => void;
  isLastStep: boolean;
  creatingNextStep?: boolean;
  transitioning?: boolean;
  transformationType: "expand" | "shrink" | "paraphrase" | "replace";
}

// Değişiklik: Generic kısıtlama T extends PyramidOptionConcreteTypes olarak güncellendi
export function BasePyramidPage<T extends PyramidOptionConcreteTypes>({
  pyramidData,
  loading,
  error,
  selectedOption,
  renderOption,
  onOptionSelect,
  getOptionSentence,
  getAffectedWords,
  onContinue,
  isLastStep,
  creatingNextStep = false,
  transitioning = false,
  transformationType,
}: BasePyramidPageProps<T>) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();
  const { saveSentence, unsaveSentence, isSentenceSaved } = useSavedSentences();

  const [isCurrentSentenceSaved, setIsCurrentSentenceSaved] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  // Check if current sentence is saved whenever pyramid data changes
  useEffect(() => {
    if (
      pyramidData &&
      pyramidData.steps.length > 0 &&
      pyramidData.last_step < pyramidData.steps.length
    ) {
      const currentStepItem = pyramidData.steps[pyramidData.last_step];
      const sentence = currentStepItem.initial_sentence;
      const meaning = currentStepItem.initial_sentence_meaning;

      setIsCurrentSentenceSaved(isSentenceSaved(sentence, meaning));
    }
  }, [pyramidData, isSentenceSaved]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (
      pyramidData &&
      pyramidData.steps.length > 0 &&
      pyramidData.last_step < pyramidData.steps.length && // last_step'in geçerli bir index olduğundan emin olalım
      !loading
    ) {
      const currentActualStep = pyramidData.steps[pyramidData.last_step];
      const actualStepType = currentActualStep.step_type;
    }
  }, [pyramidData, pathname, loading, creatingNextStep]);

  // Handle save/unsave sentence
  const handleSaveSentence = useCallback(async () => {
    if (!pyramidData || pyramidData.steps.length === 0) return;

    const currentStepItem = pyramidData.steps[pyramidData.last_step];
    const sentence = currentStepItem.initial_sentence;
    const meaning = currentStepItem.initial_sentence_meaning;

    if (isCurrentSentenceSaved) {
      // Unsave the sentence
      const success = await unsaveSentence(sentence, meaning);
      if (success) {
        setIsCurrentSentenceSaved(false);
      }
    } else {
      // Save the sentence
      const sentenceData: SaveSentenceRequest = {
        sentence: sentence,
        meaning: meaning,
        transformation_type: transformationType,
        source_sentence: sentence, // In this case, it's the original sentence
        pyramid_id: pyramidData.id,
        step_number: pyramidData.last_step,
      };

      const success = await saveSentence(sentenceData);
      if (success) {
        setIsCurrentSentenceSaved(true);
      }
    }
  }, [
    pyramidData,
    transformationType,
    isCurrentSentenceSaved,
    saveSentence,
    unsaveSentence,
  ]);

  // Speak option sentence with optional pre-speech for affected words
  const speakOptionSentence = useCallback(async (sentence: string, affectedWords?: string[]) => {
    if (!sentence) return;
    
    try {
      const learningLanguage = await AsyncStorage.getItem("learningLanguage");
      const languageCodeMap: Record<string, string> = {
        English: "en-US",
        Spanish: "es-ES",
        Turkish: "tr-TR",
      };
      
      const speechLanguageCode = learningLanguage ? languageCodeMap[learningLanguage] : null;
      
      if (speechLanguageCode) {
        // Stop any current speech
        try {
          await Speech.stop();
        } catch (stopError) {
          // If stop fails, continue anyway
          console.warn("Could not stop speech:", stopError);
        }
        
        // If there are affected words, speak them first
        if (affectedWords && affectedWords.length > 0) {
          const wordsToSpeak = affectedWords.join(", ");
          
          Speech.speak(wordsToSpeak, {
            language: speechLanguageCode,
            pitch: 1.0,
            rate: 1.2,
            onDone: () => {
              // After affected words are spoken, speak the full sentence
              setTimeout(() => {
                Speech.speak(sentence, {
                  language: speechLanguageCode,
                  pitch: 1.0,
                  rate: 1.2,
                });
              }, 200);
            }
          });
        } else {
          // No affected words, just speak the sentence
          Speech.speak(sentence, {
            language: speechLanguageCode,
            pitch: 1.0,
            rate: 1.2,
          });
        }
      }
    } catch (error) {
      console.error("Error speaking option sentence:", error);
    }
  }, []);

  // Updated option select handler that includes TTS
  const handleOptionSelectWithTTS = useCallback(async (optionIndex: number) => {
    // Stop current speech
    await stopCurrentSpeech();
    
    // Call the original onOptionSelect
    onOptionSelect(optionIndex);
    
    // If we have a way to get the option sentence and the pyramid data is available
    if (getOptionSentence && pyramidData && pyramidData.steps.length > 0) {
      const currentStepItem = pyramidData.steps[pyramidData.last_step];
      if (currentStepItem && currentStepItem.options[optionIndex]) {
        const option = currentStepItem.options[optionIndex] as T;
        const optionSentence = getOptionSentence(option);
        const affectedWords = getAffectedWords ? getAffectedWords(option) : undefined;
        
        if (optionSentence) {
          // Small delay to ensure previous speech is stopped
          setTimeout(() => {
            speakOptionSentence(optionSentence, affectedWords);
          }, 100);
        }
      }
    }
  }, [onOptionSelect, getOptionSentence, getAffectedWords, pyramidData, speakOptionSentence]);

  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  if (loading || transitioning) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={
              theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor
            }
          />
          <Text style={styles.loadingText}>
            {transitioning
              ? t("modules.pyramid.switching")
              : creatingNextStep
              ? t("modules.pyramid.creatingOptions")
              : t("modules.pyramid.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t("common.error")}: {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pyramidData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("modules.pyramid.noData")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepItem = pyramidData.steps[pyramidData.last_step];

  if (!currentStepItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t("modules.pyramid.noCurrentStep")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.sentenceHeader}>
          <BookmarkButton
            isBookmarked={isCurrentSentenceSaved}
            onPress={handleSaveSentence}
          />
        </View>
        <View style={styles.sentenceContainer}>
          <PyramidSentenceWithTTS
            sentence={currentStepItem.initial_sentence}
            meaning={currentStepItem.initial_sentence_meaning}
            autoSpeech={true}
            textStyle={styles.originalSentence}
            meaningStyle={styles.sentenceMeaning}
            showMeaning={true}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsContainer}>
          {currentStepItem.options.map((option, index) =>
            renderOption(
              option as T, // option'ın T türünde olduğunu varsayıyoruz.
              index,
              selectedOption === index,
              getOptionSentence ? () => handleOptionSelectWithTTS(index) : () => onOptionSelect(index)
            )
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Text style={styles.progressLabel}>
          {creatingNextStep
            ? t("modules.pyramid.creatingOptions")
            : t("modules.pyramid.previewReady")}
        </Text>
        <PrimaryButton
          title={isLastStep ? t("common.complete") : t("common.continue")}
          onPress={onContinue}
          disabled={selectedOption === null || creatingNextStep}
        />
      </View>
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
    scrollView: {
      flex: 1,
      paddingHorizontal: horizontalScale(20),
      paddingTop: verticalScale(10),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginTop: verticalScale(16),
      fontFamily: "Regular",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalScale(20),
    },
    errorText: {
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      textAlign: "center",
      fontFamily: "Regular",
    },
    headerContainer: {
      paddingHorizontal: horizontalScale(20),
    },
    sentenceHeader: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: verticalScale(50),
    },
    sentenceContainer: {
      marginBottom: verticalScale(8),
    },
    originalSentence: {
      fontSize: horizontalScale(22),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
      marginBottom: verticalScale(8),
      fontFamily: "Bold",
    },
    sentenceMeaning: {
      fontSize: horizontalScale(14),
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      textAlign: "center",
      fontFamily: "Regular",
    },
    optionsContainer: {
      marginBottom: verticalScale(20),
    },
    buttonContainer: {
      paddingHorizontal: horizontalScale(20),
      paddingBottom: verticalScale(20),
      paddingTop: verticalScale(16),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    progressLabel: {
      fontSize: horizontalScale(14),
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      textAlign: "center",
      marginBottom: verticalScale(12),
      fontFamily: "Regular",
    },
  });
