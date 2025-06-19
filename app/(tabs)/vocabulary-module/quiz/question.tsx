import React, { useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import QuestionWord from "@/components/QuestionWord";
import AnswerInput from "@/components/AnswerInput";
import QuizButtons from "@/components/QuizButtons";

import { useVocabularyQuiz } from "@/hooks/useVocabularyQuiz";
import { BookmarkButton } from "@/components/BookmarkButton";

export default function VocabularyQuizScreen() {
  // Ensure navigation bar stays hidden during vocabulary questions
  useNavigationBar();

  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const params = useLocalSearchParams();
  const wordListParam = params.wordList as string;
  const stepIndexParam = params.stepIndex as string;
  const vocabularyListId = (params.vocabularyListId as string) || undefined;
  const existingEventId = (params.eventId as string) || undefined;

  const { wordListArray, currentIndex, isLastStep } = useMemo(() => {
    try {
      const parsedWordList = wordListParam
        ? JSON.parse(decodeURIComponent(wordListParam))
        : [];

      const parsedIndex = stepIndexParam ? parseInt(stepIndexParam, 10) : 0;

      return {
        wordListArray: Array.isArray(parsedWordList) ? parsedWordList : [],
        currentIndex: isNaN(parsedIndex) ? 0 : parsedIndex,
        isLastStep: parsedIndex >= parsedWordList.length - 1,
      };
    } catch (error) {
      console.error("Error parsing params:", error);
      return {
        wordListArray: [],
        currentIndex: 0,
        isLastStep: true,
      };
    }
  }, [wordListParam, stepIndexParam]);

  const {
    inputValue,
    setInputValue,
    showRelevantPopup,
    popupWord,
    popupEmoji,
    revealedLetterCount,
    isWrongAnswer,
    isBookmarked,
    handleGetRelevantWord,
    handleOpenOneLetter,
    handleGetEmoji,
    handleNext,
    handleCloseRelevantPopup,
    handleBookmarkToggle,
    hasRelevantWords,
    hasEmoji,
    eventId,
    sessionStartTime,
    updateVocabularyEvent,
    completeVocabularyEvent,
  } = useVocabularyQuiz({
    wordListArray,
    currentIndex,
    isLastStep,
    vocabularyListId,
    existingEventId,
  });


  // Update event when the quiz is completed
  useEffect(() => {
    if (!eventId) return;

    // Cleanup function: update the event one last time when component unmounts
    return () => {
      const currentTime = Date.now();
      const durationSeconds = Math.floor(
        (currentTime - sessionStartTime) / 1000
      );

      updateVocabularyEvent({
        duration_seconds: durationSeconds,
      });
    };
  }, [eventId, sessionStartTime]);


  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <View style={styles.questionContainer}>
            <QuestionWord
              word={wordListArray[currentIndex]?.word || ""}
              visible={showRelevantPopup}
              popupWord={popupWord}
              popupEmoji={popupEmoji}
              onClose={handleCloseRelevantPopup}
              autoSpeech={true}
            />
          </View>

          <BookmarkButton
            onPress={handleBookmarkToggle}
            style={styles.bookmark}
            isBookmarked={isBookmarked}
          />

          <View style={styles.inputContainer}>
            <AnswerInput
              length={wordListArray[currentIndex]?.meaning?.length || 0}
              value={inputValue}
              onChange={setInputValue}
              revealedLetterCount={revealedLetterCount}
              correctWord={wordListArray[currentIndex]?.meaning || ""}
              theme={theme}
              onClear={() => setInputValue("")}
              isWrongAnswer={isWrongAnswer}
            />
          </View>

          <QuizButtons
            isLastStep={isLastStep}
            handleGetRelevantWord={handleGetRelevantWord}
            handleOpenOneLetter={handleOpenOneLetter}
            handleGetEmoji={handleGetEmoji}
            handleNext={handleNext}
            isRelevantWordDisabled={!hasRelevantWords}
            isEmojiDisabled={!hasEmoji}
          />

        </View>
      </TouchableWithoutFeedback>
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
    innerContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
    },
    questionContainer: {
      marginVertical: verticalScale(80),
    },
    inputContainer: {
      marginBottom: verticalScale(50),
      width: "100%",
      alignItems: "center",
    },
    bookmark: {
      marginRight: verticalScale(20),
      marginTop: verticalScale(20),
    },
  });
