import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useAuth } from "@/contexts/AuthenticationContext";
import PrimaryButton from "@/components/PrimaryButton";
import ReturnButton from "@/components/ReturnButton";
import type {
  DetailedWritingResponse,
  WritingFeedbackItem,
} from "@/types/writing";

export default function AnswerEvaluation() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // State for real evaluation results
  const [evaluationResult, setEvaluationResult] =
    useState<DetailedWritingResponse | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [questionTitle, setQuestionTitle] = useState<string>("");
  const [xpEarned, setXpEarned] = useState<number>(0);

  useEffect(() => {
    // Parse the real evaluation data from navigation params
    if (params.evaluationResult) {
      try {
        const parsedResult = JSON.parse(params.evaluationResult as string);
        setEvaluationResult(parsedResult);
      } catch (error) {
        console.error("Error parsing evaluation result:", error);
        Alert.alert(
          t("modules.writing.evaluation.error"),
          t("modules.writing.evaluation.errorParsingResults")
        );
      }
    }
  }, [params.evaluationResult, t]);

  useEffect(() => {
    if (params.userAnswer) {
      setUserAnswer(params.userAnswer as string);
    }
  }, [params.userAnswer]);

  useEffect(() => {
    if (params.question) {
      setQuestion(params.question as string);
    }
  }, [params.question]);

  useEffect(() => {
    if (params.questionTitle) {
      setQuestionTitle(params.questionTitle as string);
    }
  }, [params.questionTitle]);

  useEffect(() => {
    // Parse XP earned from params
    if (params.xpEarned) {
      try {
        const xp = parseInt(params.xpEarned as string, 10);
        setXpEarned(xp);
      } catch (error) {
        console.error("Error parsing XP earned:", error);
      }
    }
  }, [params.xpEarned]);

  // Handle special return navigation
  const handleReturn = () => {
    if (token && evaluationResult) {
      // For authenticated users with results, offer options
      Alert.alert(
        t("modules.writing.evaluation.whereToGo"),
        t("modules.writing.evaluation.chooseNextAction"),
        [
          {
            text: t("modules.writing.evaluation.writeAnother"),
            onPress: () => router.push("/writing-module/questions"),
          },
          {
            text: t("modules.writing.evaluation.viewHistory"),
            onPress: () => router.push("/writing-module/history"),
          },
          {
            text: t("modules.writing.evaluation.backToWriting"),
            onPress: () => router.push("./writing-module/"),
          },
        ]
      );
    } else {
      // Default behavior for guests or error states
      router.back();
    }
  };

  // Helper function to render score with visual indicator
  const renderScoreIndicator = (score: number, maxScore: number = 5) => {
    const percentage = (score / maxScore) * 100;
    let color = "#FF6B6B"; // Red for low scores
    if (percentage >= 70) color = "#51CF66"; // Green for good scores
    else if (percentage >= 50) color = "#FFD43B"; // Yellow for average scores

    return (
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreText, { color }]}>
          {score}/{maxScore}
        </Text>
        <View
          style={[
            styles.scoreBar,
            { backgroundColor: color, width: `${percentage}%` },
          ]}
        />
      </View>
    );
  };

  // Show loading state if no evaluation result
  if (!evaluationResult) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>
          {t("modules.writing.evaluation.loadingEvaluation")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ReturnButton onPress={handleReturn} />
      <Text style={styles.header}>{t("modules.writing.evaluationTitle")}</Text>
      <Text style={styles.subheader}>
        {token
          ? t("modules.writing.evaluation.evaluationSubtitleAuth")
          : t("modules.writing.evaluation.evaluationSubtitleGuest")}
      </Text>

      <ScrollView style={styles.scrollView}>
        {/* Question and Answer Section */}
        <View style={styles.questionSection}>
          <Text style={styles.questionTitle}>{questionTitle}</Text>
          <Text style={styles.questionText}>{question}</Text>

          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>
              {t("modules.writing.yourAnswer")}:
            </Text>
            <Text style={styles.answerText}>{userAnswer}</Text>
          </View>
        </View>

        {/* Overall Score Section */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>
            {t("modules.writing.evaluation.overallScore")}
          </Text>
          <Text style={styles.totalScore}>{evaluationResult.score}/100</Text>
          {token && xpEarned > 0 && (
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>
                🎉 {t("modules.writing.evaluation.xpEarned")}: +{xpEarned} XP
              </Text>
              <Text style={styles.xpSubtext}>
                {t("modules.writing.evaluation.xpFromEventSystem")}
              </Text>
            </View>
          )}
        </View>

        {/* Detailed Scores Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>
            {t("modules.writing.evaluation.detailedScores")}
          </Text>

          <View style={styles.scoreRow}>
            <Text style={styles.criteriaLabel}>
              {t("modules.writing.evaluation.content")}
            </Text>
            {renderScoreIndicator(evaluationResult.details.content_score)}
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.criteriaLabel}>
              {t("modules.writing.evaluation.organization")}
            </Text>
            {renderScoreIndicator(evaluationResult.details.organization_score)}
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.criteriaLabel}>
              {t("modules.writing.evaluation.language")}
            </Text>
            {renderScoreIndicator(evaluationResult.details.language_score)}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {t("modules.writing.evaluation.totalScore")}
            </Text>
            <Text style={styles.totalValue}>
              {evaluationResult.details.total_score}/15
            </Text>
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>
            {t("modules.writing.feedback")}:
          </Text>
          <Text style={styles.feedbackText}>{evaluationResult.feedback}</Text>
        </View>

        {/* Specific Feedback Items */}
        {evaluationResult.feedback_items &&
          evaluationResult.feedback_items.length > 0 && (
            <View style={styles.feedbackItemsSection}>
              <Text style={styles.sectionTitle}>
                {t("modules.writing.evaluation.specificFeedback")}
              </Text>
              {evaluationResult.feedback_items.map((item, index) => (
                <View key={index} style={styles.feedbackItem}>
                  <Text style={styles.feedbackItemType}>
                    {t(`modules.writing.evaluation.feedbackTypes.${item.type}`)}
                  </Text>
                  <Text style={styles.feedbackItemError}>"{item.error}"</Text>
                  <Text style={styles.feedbackItemSuggestion}>
                    {t("modules.writing.evaluation.suggestion")}: {item.suggestion}
                  </Text>
                </View>
              ))}
            </View>
          )}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title={t("modules.writing.evaluation.backToWriting")}
          onPress={() => router.push("/writing-module/")}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (n: number) => number,
  verticalScale: (n: number) => number
) => {
  const themeColors = theme === "dark" ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundColor,
      padding: horizontalScale(16),
    },
    header: {
      fontSize: horizontalScale(24),
      fontFamily: "Bold",
      color: themeColors.textColor,
      marginBottom: verticalScale(8),
      textAlign: "center",
    },
    subheader: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: themeColors.textColor,
      marginBottom: verticalScale(16),
      textAlign: "center",
    },
    scrollView: {
      flex: 1,
    },
    questionSection: {
      marginBottom: verticalScale(20),
      padding: horizontalScale(16),
      borderRadius: horizontalScale(12),
      backgroundColor: themeColors.cardBackgroundColor,
    },
    questionTitle: {
      fontSize: horizontalScale(18),
      fontFamily: "Semibold",
      color: themeColors.textColor,
      marginBottom: verticalScale(8),
    },
    questionText: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.textColor,
      marginBottom: verticalScale(12),
    },
    answerContainer: {
      marginBottom: verticalScale(16),
      padding: horizontalScale(12),
      borderRadius: horizontalScale(8),
      backgroundColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    },
    answerLabel: {
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      color: themeColors.textColor,
      marginBottom: verticalScale(4),
    },
    answerText: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.textColor,
    },
    scoreSection: {
      marginBottom: verticalScale(20),
      padding: horizontalScale(16),
      borderRadius: horizontalScale(12),
      backgroundColor: themeColors.cardBackgroundColor,
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: horizontalScale(18),
      fontFamily: "Semibold",
      color: themeColors.textColor,
      marginBottom: verticalScale(12),
    },
    totalScore: {
      fontSize: horizontalScale(36),
      fontFamily: "Bold",
      color: themeColors.primaryColor,
      marginBottom: verticalScale(8),
    },
    xpContainer: {
      alignItems: "center",
      marginTop: verticalScale(8),
      padding: horizontalScale(12),
      borderRadius: horizontalScale(8),
      backgroundColor: "rgba(81, 207, 102, 0.1)", // Light green background
    },
    xpText: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: "#51CF66",
      marginBottom: verticalScale(4),
    },
    xpSubtext: {
      fontSize: horizontalScale(12),
      fontFamily: "Regular",
      color: "#51CF66",
      opacity: 0.7,
    },
    detailsSection: {
      marginBottom: verticalScale(20),
      padding: horizontalScale(16),
      borderRadius: horizontalScale(12),
      backgroundColor: themeColors.cardBackgroundColor,
    },
    scoreRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    criteriaLabel: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: themeColors.textColor,
      flex: 1,
    },
    scoreContainer: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: horizontalScale(80),
    },
    scoreText: {
      fontSize: horizontalScale(16),
      fontFamily: "Bold",
      marginRight: horizontalScale(8),
      minWidth: horizontalScale(30),
    },
    scoreBar: {
      height: verticalScale(6),
      borderRadius: horizontalScale(3),
      minWidth: horizontalScale(4),
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: themeColors.borderColor,
      paddingTop: verticalScale(12),
      marginTop: verticalScale(8),
    },
    totalLabel: {
      fontSize: horizontalScale(18),
      fontFamily: "Semibold",
      color: themeColors.textColor,
    },
    totalValue: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: themeColors.primaryColor,
    },
    feedbackContainer: {
      marginBottom: verticalScale(20),
      padding: horizontalScale(16),
      borderRadius: horizontalScale(12),
      backgroundColor:
        theme === "dark"
          ? "rgba(0, 122, 255, 0.15)"
          : "rgba(0, 122, 255, 0.08)",
    },
    feedbackLabel: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: themeColors.textColor,
      marginBottom: verticalScale(8),
    },
    feedbackText: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.textColor,
      lineHeight: horizontalScale(20),
    },
    feedbackItemsSection: {
      marginBottom: verticalScale(20),
      padding: horizontalScale(16),
      borderRadius: horizontalScale(12),
      backgroundColor: themeColors.cardBackgroundColor,
    },
    feedbackItem: {
      marginBottom: verticalScale(12),
      padding: horizontalScale(12),
      borderRadius: horizontalScale(8),
      backgroundColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
    },
    feedbackItemType: {
      fontSize: horizontalScale(14),
      fontFamily: "Semibold",
      color: "#FF6B6B",
      marginBottom: verticalScale(4),
    },
    feedbackItemError: {
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      color: themeColors.textColor,
      fontStyle: "italic",
      marginBottom: verticalScale(4),
    },
    feedbackItemSuggestion: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.textColor,
    },
    buttonsContainer: {
      marginTop: verticalScale(16),
      marginBottom: verticalScale(16),
    },
  });
};
