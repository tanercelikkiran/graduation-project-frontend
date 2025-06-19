import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useWriting } from "@/hooks/useWriting";
import Timer from "@/components/Timer";
import WritingInput from "@/components/WritingInput";
import PrimaryButton from "@/components/PrimaryButton";
import TextButton from "@/components/TextButton";
import ReturnButton from "@/components/ReturnButton";
import * as Progress from "react-native-progress";

// Default question for fallback
const defaultQuestion = {
  id: "default",
  title: "Writing Practice",
  description: "Write about a topic of your choice.",
};

export default function QuestionPage() {
  // Ensure navigation bar stays hidden during writing questions
  useNavigationBar();

  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { horizontalScale, verticalScale } = useScale();
  const { token } = useAuth();
  const {
    submitWriting,
    submitGuestWriting,
    answerScenarioQuestion,
    createWritingEvent,
    completeWritingEvent,
    loading,
    error,
    currentEventId,
  } = useWriting();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Get question data from params
  const currentQuestion = {
    id: (params.id as string) || defaultQuestion.id,
    title: (params.title as string) || defaultQuestion.title,
    description: (params.description as string) || defaultQuestion.description,
  };

  // Get scenarios if available
  const scenarios = params.scenarios
    ? JSON.parse(params.scenarios as string)
    : [];
  const level = params.level as string;

  // State for answers to each scenario
  const [scenarioAnswers, setScenarioAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  // 1. Create writing event when user starts writing (component mounts)
  useEffect(() => {
    if (token && currentQuestion.id && level && !currentEventId) {
      createWritingEvent(currentQuestion.id, level).catch((error) => {
        console.error("Failed to create writing event:", error);
      });
    }
  }, [token, currentQuestion.id, level, currentEventId, createWritingEvent]);

  // Update answer for current scenario
  const handleCurrentScenarioAnswerChange = (text: string) => {
    setScenarioAnswers((prev) => ({
      ...prev,
      [currentScenarioIndex]: text,
    }));
  };

  // Navigate between scenarios
  const goToPreviousScenario = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex(currentScenarioIndex - 1);
    }
  };

  const goToNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    }
  };

  // Handle special return button behavior
  const handleReturn = () => {
    // Check if user has unsaved changes
    const hasUnsavedChanges = Object.values(scenarioAnswers).some(
      (answer) => answer.trim() !== ""
    );

    if (hasUnsavedChanges) {
      Alert.alert(
        t("modules.writing.unsavedChanges"),
        t("modules.writing.unsavedChangesMessage"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("modules.writing.discardChanges"),
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    // Check if at least one scenario has an answer
    const answeredScenarios = Object.values(scenarioAnswers).filter(
      (answer) => answer.trim() !== ""
    );

    if (answeredScenarios.length === 0) {
      Alert.alert(
        t("modules.writing.emptyAnswer"),
        t("modules.writing.emptyAnswerMessage")
      );
      return;
    }

    try {
      if (token && scenarios.length > 0) {
        const scenarioAnswersArray = scenarios
          .map((scenario: string, index: number) => ({
            scenario_index: index,
            scenario_text: scenario,
            answer: scenarioAnswers[index] || "",
          }))
          .filter((sa: { answer: string }) => sa.answer.trim() !== "");

        if (scenarioAnswersArray.length === 0) {
          Alert.alert(
            t("modules.writing.emptyAnswer"),
            t("modules.writing.emptyAnswerMessage")
          );
          return;
        }

        const combinedAnswer = scenarioAnswersArray
          .map(
            (sa: { scenario_text: any; answer: any }) =>
              `${sa.scenario_text}: ${sa.answer}`
          )
          .join("\n\n");

        // 2. Complete writing event with final answer and get XP
        if (currentEventId) {
          const eventResult = await completeWritingEvent(
            currentEventId,
            combinedAnswer
          );

          if (eventResult) {
            // Navigate to evaluation page with event results and XP
            router.push({
              pathname: "/writing-module/answer-evaluation",
              params: {
                evaluationResult: JSON.stringify(eventResult.evaluation),
                userAnswer: combinedAnswer,
                question: currentQuestion.description,
                questionTitle: currentQuestion.title,
                xpEarned: eventResult.xpEarned.toString(), // 3. Show XP earned
              },
            });
            return;
          }
        }

        // Fallback to old method if event fails
        const scenarioRequest = {
          question_id: currentQuestion.id,
          level: level,
          scenario_answers: scenarioAnswersArray,
        };

        console.log("DEBUG: Sending scenario request:", scenarioRequest);
        const result = await answerScenarioQuestion(scenarioRequest);

        // Navigate to evaluation page with scenario results
        router.push({
          pathname: "/writing-module/answer-evaluation",
          params: {
            evaluationResult: JSON.stringify(result.evaluation),
            userAnswer: result.combined_answer,
            question: currentQuestion.description,
            questionTitle: currentQuestion.title,
          },
        });
      } else {
        // For guests or questions without scenarios
        const combinedAnswers = scenarios
          .map((scenario: string, index: number) => {
            const answer = scenarioAnswers[index];
            if (answer && answer.trim()) {
              return `${scenario}: ${answer}`;
            }
            return null;
          })
          .filter(Boolean)
          .join("\n\n");

        // 2. Complete writing event for authenticated users
        if (token && currentEventId && combinedAnswers.trim()) {
          const eventResult = await completeWritingEvent(
            currentEventId,
            combinedAnswers
          );

          if (eventResult) {
            // Navigate to evaluation page with event results and XP
            router.push({
              pathname: "/writing-module/answer-evaluation",
              params: {
                evaluationResult: JSON.stringify(eventResult.evaluation),
                userAnswer: combinedAnswers,
                question: currentQuestion.description,
                questionTitle: currentQuestion.title,
                xpEarned: eventResult.xpEarned.toString(), // 3. Show XP earned
              },
            });
            return;
          }
        }

        // Fallback to old method for guests or if event fails
        const evaluationRequest = {
          text: combinedAnswers,
          question: currentQuestion.description,
        };

        let result;
        if (token) {
          result = await submitWriting(evaluationRequest);
        } else {
          result = await submitGuestWriting(evaluationRequest);
        }

        // Navigate to evaluation page with results
        router.push({
          pathname: "/writing-module/answer-evaluation",
          params: {
            evaluationResult: JSON.stringify(result),
            userAnswer: combinedAnswers,
            question: currentQuestion.description,
            questionTitle: currentQuestion.title,
          },
        });
      }
    } catch (err) {
      console.error("Writing evaluation error:", err);
      Alert.alert(
        t("modules.writing.evaluationError"),
        err instanceof Error
          ? err.message
          : t("modules.writing.evaluationErrorGeneric")
      );
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          theme === "dark"
            ? darkTheme.backgroundColor
            : lightTheme.backgroundColor,
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ReturnButton onPress={handleReturn} />
        <View style={styles.timerContainer}>
          <Timer totalTime={20 * 60 * 1000} />
        </View>

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
            <Text style={styles.questionText}>
              {currentQuestion.description}
            </Text>
          </View>

          <View style={styles.scenarioHeader}>
            <Progress.Bar
              progress={(currentScenarioIndex + 1) / scenarios.length}
              width={horizontalScale(300)}
              height={8}
              borderRadius={4}
              color={
                theme === "dark"
                  ? darkTheme.primaryColor
                  : lightTheme.primaryColor
              }
              unfilledColor={
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)"
              }
              borderWidth={0}
            />
          </View>

          {/* Show current scenario with navigation */}
          {scenarios.length > 0 && (
            <View style={styles.scenariosContainer}>
              <View style={styles.currentScenarioContainer}>
                <Text style={styles.scenarioLabel}>
                  {scenarios[currentScenarioIndex]}
                </Text>
                <WritingInput
                  value={scenarioAnswers[currentScenarioIndex] || ""}
                  onChangeText={handleCurrentScenarioAnswerChange}
                  placeholder={t("modules.writing.writeAnswerForScenario", {
                    scenario: (currentScenarioIndex + 1).toString(),
                  })}
                  minHeight={verticalScale(200)}
                />
              </View>
            </View>
          )}

          {/* Navigation and Submit Buttons */}
          {scenarios.length > 0 ? (
            <View style={styles.submitContainer}>
              {currentScenarioIndex === scenarios.length - 1 ? (
                // Show previous and submit buttons on last scenario
                <View style={styles.navigationButtons}>
                  {currentScenarioIndex > 0 && (
                    <TextButton
                      title={t("common.previous")}
                      onPress={goToPreviousScenario}
                    />
                  )}
                  <PrimaryButton
                    title={
                      loading
                        ? t("modules.writing.submitting")
                        : t("modules.writing.submit")
                    }
                    onPress={handleSubmit}
                    disabled={loading}
                  />
                </View>
              ) : (
                // Show navigation buttons on other scenarios
                <View style={styles.navigationButtons}>
                  {currentScenarioIndex > 0 && (
                    <TextButton
                      title={t("common.previous")}
                      onPress={goToPreviousScenario}
                    />
                  )}
                  <PrimaryButton
                    title={t("common.next")}
                    onPress={goToNextScenario}
                  />
                </View>
              )}
            </View>
          ) : (
            // Default submit button when no scenarios
            <View style={styles.submitContainer}>
              <PrimaryButton
                title={
                  loading
                    ? t("modules.writing.submitting")
                    : t("modules.writing.submit")
                }
                onPress={handleSubmit}
                disabled={loading}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) => {
  const themeColors = theme === "dark" ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundColor,
      padding: horizontalScale(16),
    },
    scrollView: {
      flex: 1,
    },
    timerContainer: {
      borderRadius: horizontalScale(8),
      alignItems: "center",
    },
    scenariosContainer: {
      marginTop: verticalScale(16),
      padding: horizontalScale(16),
    },
    scenariosTitle: {
      fontSize: horizontalScale(16),
      fontFamily: "Semibold",
      color: themeColors.textColor,
      marginBottom: verticalScale(12),
    },
    scenarioHeader: {
      marginBottom: verticalScale(16),
      alignItems: "center",
      gap: verticalScale(12),
    },
    navigationButtons: {
      flexDirection: "column",
      gap: verticalScale(12),
    },
    currentScenarioContainer: {
      marginBottom: verticalScale(20),
    },
    scenarioLabel: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: themeColors.textColor,
      marginBottom: verticalScale(12),
      lineHeight: horizontalScale(24),
    },
    questionContainer: {
      padding: horizontalScale(16),
      borderRadius: horizontalScale(8),
      marginBottom: verticalScale(20),
    },
    questionTitle: {
      fontSize: horizontalScale(20),
      fontFamily: "Semibold",
      color: themeColors.textColor,
      marginBottom: verticalScale(8),
    },
    questionText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: themeColors.textColor,
    },
    submitContainer: {
      marginTop: verticalScale(20),
      marginBottom: verticalScale(40),
    },
  });
};
