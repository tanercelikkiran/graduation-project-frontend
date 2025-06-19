import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useWritingHistory } from "@/hooks/useWriting";
import PrimaryButton from "@/components/PrimaryButton";
import ReturnButton from "@/components/ReturnButton";
import type { WritingSubmission } from "@/types/writing";

export default function WritingHistoryPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const { horizontalScale, verticalScale } = useScale();
  const { 
    history, 
    loading, 
    error, 
    fetchHistory, 
    hasMore, 
    loadMore 
  } = useWritingHistory();

  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(theme, horizontalScale, verticalScale);

  useNavigationBar();

  // Load initial history
  useEffect(() => {
    if (token) {
      fetchHistory(20);
    }
  }, [token, fetchHistory]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory(20);
    setRefreshing(false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  // Handle special return navigation - clear route stack and go to main
  const handleReturn = () => {
    router.replace("/writing-module");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get score color based on performance
  const getScoreColor = (score: number, maxScore: number = 15) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "#51CF66"; // Green
    if (percentage >= 60) return "#FFD43B"; // Yellow
    return "#FF6B6B"; // Red
  };

  // Redirect if not authenticated
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <ReturnButton onPress={() => router.back()} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {t("modules.writing.authRequired")}
          </Text>
          <PrimaryButton
            title={t("auth.login")}
            onPress={() => router.push("/login")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ReturnButton onPress={handleReturn} />
        <Text style={styles.title}>{t("modules.writing.writingHistory")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
          <PrimaryButton
            title={t("common.retry")}
            onPress={() => fetchHistory(20)}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme === "dark" ? darkTheme.primaryColor : lightTheme.primaryColor]}
              tintColor={theme === "dark" ? darkTheme.primaryColor : lightTheme.primaryColor}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            if (isCloseToBottom && hasMore && !loading) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {history.length > 0 ? (
            <>
              {history.map((submission, index) => (
                <View key={`${submission.created_at}-${index}`} style={styles.submissionCard}>
                  <View style={styles.submissionHeader}>
                    <Text style={styles.submissionDate}>
                      {formatDate(submission.created_at)}
                    </Text>
                    <View style={styles.scoreContainer}>
                      <Text style={[
                        styles.scoreText,
                        { color: getScoreColor(submission.total_score) }
                      ]}>
                        {submission.total_score}/15
                      </Text>
                      {submission.xp_earned && (
                        <Text style={styles.xpText}>
                          +{submission.xp_earned} XP
                        </Text>
                      )}
                    </View>
                  </View>

                  {submission.question && (
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionLabel}>
                        {t("modules.writing.question")}:
                      </Text>
                      <Text style={styles.questionText} numberOfLines={2}>
                        {submission.question}
                      </Text>
                    </View>
                  )}

                  <View style={styles.answerContainer}>
                    <Text style={styles.answerLabel}>
                      {t("modules.writing.yourAnswer")}:
                    </Text>
                    <Text style={styles.answerText} numberOfLines={3}>
                      {submission.text}
                    </Text>
                  </View>

                  <View style={styles.scoresBreakdown}>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>
                        {t("modules.writing.content")}
                      </Text>
                      <Text style={[
                        styles.scoreValue,
                        { color: getScoreColor(submission.content_score, 5) }
                      ]}>
                        {submission.content_score}/5
                      </Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>
                        {t("modules.writing.organization")}
                      </Text>
                      <Text style={[
                        styles.scoreValue,
                        { color: getScoreColor(submission.organization_score, 5) }
                      ]}>
                        {submission.organization_score}/5
                      </Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>
                        {t("modules.writing.language")}
                      </Text>
                      <Text style={[
                        styles.scoreValue,
                        { color: getScoreColor(submission.language_score, 5) }
                      ]}>
                        {submission.language_score}/5
                      </Text>
                    </View>
                  </View>

                  {submission.feedback && (
                    <View style={styles.feedbackContainer}>
                      <Text style={styles.feedbackLabel}>
                        {t("modules.writing.feedback")}:
                      </Text>
                      <Text style={styles.feedbackText} numberOfLines={4}>
                        {submission.feedback}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <View style={styles.loadMoreContainer}>
                  {loading ? (
                    <ActivityIndicator 
                      size="large" 
                      color={theme === "dark" ? darkTheme.primaryColor : lightTheme.primaryColor}
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={handleLoadMore}
                    >
                      <Text style={styles.loadMoreText}>
                        {t("modules.writing.loadMore")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          ) : loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator 
                size="large" 
                color={theme === "dark" ? darkTheme.primaryColor : lightTheme.primaryColor}
              />
              <Text style={styles.loadingText}>
                {t("modules.writing.loadingHistory")}
              </Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {t("modules.writing.noHistory")}
              </Text>
              <Text style={styles.emptySubtext}>
                {t("modules.writing.startWriting")}
              </Text>
              <PrimaryButton
                title={t("modules.writing.startWriting")}
                onPress={() => router.push("/writing-module/questions")}
              />
            </View>
          )}
        </ScrollView>
      )}
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
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    title: {
      flex: 1,
      fontSize: horizontalScale(20),
      fontFamily: "Bold",
      color: themeColors.textColor,
      textAlign: "center",
    },
    headerSpacer: {
      width: horizontalScale(40),
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: horizontalScale(16),
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalScale(32),
    },
    errorText: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: "#FF6B6B",
      textAlign: "center",
      marginBottom: verticalScale(16),
    },
    loadingText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: themeColors.textColor,
      marginTop: verticalScale(16),
    },
    emptyText: {
      fontSize: horizontalScale(18),
      fontFamily: "Medium",
      color: themeColors.textColor,
      textAlign: "center",
      marginBottom: verticalScale(8),
    },
    emptySubtext: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.textColor,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: verticalScale(24),
    },
    submissionCard: {
      backgroundColor: themeColors.cardBackgroundColor,
      borderRadius: horizontalScale(12),
      padding: horizontalScale(16),
      marginVertical: verticalScale(8),
    },
    submissionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    submissionDate: {
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      color: themeColors.textColor,
      opacity: 0.7,
    },
    scoreContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: horizontalScale(8),
    },
    scoreText: {
      fontSize: horizontalScale(16),
      fontFamily: "Bold",
    },
    xpText: {
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      color: "#51CF66",
    },
    questionContainer: {
      marginBottom: verticalScale(12),
    },
    questionLabel: {
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      color: themeColors.textColor,
      marginBottom: verticalScale(4),
    },
    questionText: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.textColor,
      fontStyle: "italic",
    },
    answerContainer: {
      marginBottom: verticalScale(12),
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
      lineHeight: horizontalScale(20),
    },
    scoresBreakdown: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: 
        theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
      borderRadius: horizontalScale(8),
      paddingVertical: verticalScale(12),
      marginBottom: verticalScale(12),
    },
    scoreItem: {
      alignItems: "center",
    },
    scoreLabel: {
      fontSize: horizontalScale(12),
      fontFamily: "Regular",
      color: themeColors.textColor,
      opacity: 0.7,
      marginBottom: verticalScale(4),
    },
    scoreValue: {
      fontSize: horizontalScale(16),
      fontFamily: "Bold",
    },
    feedbackContainer: {
      backgroundColor: 
        theme === "dark" 
          ? "rgba(0, 122, 255, 0.1)" 
          : "rgba(0, 122, 255, 0.05)",
      borderRadius: horizontalScale(8),
      padding: horizontalScale(12),
    },
    feedbackLabel: {
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      color: themeColors.textColor,
      marginBottom: verticalScale(4),
    },
    feedbackText: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.textColor,
      lineHeight: horizontalScale(18),
    },
    loadMoreContainer: {
      alignItems: "center",
      paddingVertical: verticalScale(20),
    },
    loadMoreButton: {
      paddingHorizontal: horizontalScale(24),
      paddingVertical: verticalScale(12),
      backgroundColor: themeColors.primaryColor,
      borderRadius: horizontalScale(8),
    },
    loadMoreText: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: "#FFFFFF",
    },
  });
};