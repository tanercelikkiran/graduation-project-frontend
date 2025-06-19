import { useTheme } from "@/contexts/ThemeContext";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { darkTheme, lightTheme } from "@/themes/Themes";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useScale } from "@/hooks/useScale";
import LevelCircularProgress from "@/components/LevelCircularProgress";
import QuestionItem from "@/components/QuestionItem";
import SearchBar from "@/components/SearchBar";
import { useWritingQuestions } from "@/hooks/useWriting";
import type { WritingQuestion } from "@/types/writing";
import ReturnButton from "@/components/ReturnButton";

export default function QuestionsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const params = useLocalSearchParams();
  const level = (params.level as string) || "beginner"; // Default to beginner if no level provided

  const { questions, loading, error, fetchQuestions, progress, fetchProgress } = useWritingQuestions();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState<WritingQuestion[]>([]);

  // Fetch questions and progress when level changes
  useEffect(() => {
    if (level) {
      fetchQuestions(level);
      fetchProgress(level);
    }
  }, [level, fetchQuestions, fetchProgress]);

  // Refresh data when the screen comes into focus (e.g., returning from evaluation page)
  useFocusEffect(
    useCallback(() => {
      if (level) {
        fetchQuestions(level);
        fetchProgress(level);
      }
    }, [level, fetchQuestions, fetchProgress])
  );

  // Update filtered questions when questions or search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(
        (question) =>
          question.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  }, [questions, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleQuestionPress = (question: WritingQuestion) => {
    router.push({
      pathname: "/writing-module/question",
      params: {
        title: question.name,
        description: question.full_name,
        id: question.id,
        level: level,
        scenarios: JSON.stringify(question.scenarios),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <ReturnButton onPress={() => router.back()} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t(`modules.writing.questions.${level}Questions`)}
        </Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <LevelCircularProgress
          solved={progress[level]?.solved || 0}
          total={progress[level]?.total || questions.length}
        />
      </View>
      <View style={styles.remainedQuestionsContainer}>
        <Text style={styles.remainedQuestionsText}>
          {t("modules.writing.questions.remainedQuestions", {
            solved: progress[level]?.solved || 0,
            total: progress[level]?.total || questions.length,
          })}
        </Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder={t("common.search")}
          searchText={searchQuery}
          setSearchText={handleSearch}
        />
      </View>

      {/* Content Section */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={
              theme === "dark"
                ? darkTheme.primaryColor
                : lightTheme.primaryColor
            }
          />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : (
        <ScrollView style={styles.questionsContainer}>
          {filteredQuestions.map((question) => (
            <QuestionItem
              key={question.id}
              question={{
                id: question.id,
                title: question.name,
                short_description: question.full_name,
                solved: question.solved,
              }}
              onPress={() => handleQuestionPress(question)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any, horizontalScale: any, verticalScale: any) => {
  const themeColors = theme === "dark" ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    header: {
      flexDirection: "row",
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(16),
    },
    headerTitle: {
      flex: 1,
      fontSize: horizontalScale(20),
      fontFamily: "Semibold",
      color: themeColors.textColor,
      textAlign: "center",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalScale(32),
    },
    loadingText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: themeColors.textColor,
      marginTop: verticalScale(16),
    },
    errorText: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: "#FF6B6B",
      textAlign: "center",
    },
    progressContainer: {
      alignItems: "center",
      marginVertical: verticalScale(20),
    },
    remainedQuestionsContainer: {
      alignItems: "center",
      marginBottom: verticalScale(16),
    },
    remainedQuestionsText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: themeColors.textColor,
    },
    searchContainer: {
      paddingHorizontal: horizontalScale(16),
      marginBottom: verticalScale(16),
    },
    questionsContainer: {
      flex: 1,
      width: "100%",
    },
  });
};
