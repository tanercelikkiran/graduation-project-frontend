import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

// Import arrow icons for both light and dark themes
import Arrow from "@/assets/icons/Short Arrow Right Dark.svg";
import { useScale } from "@/hooks/useScale";
import { useWritingQuestions } from "@/hooks/useWriting";
import { useRouter } from "expo-router";
import type { WritingQuestion } from "@/types/writing";

export default function SuggestedQuestion() {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const { getFirstUnsolvedQuestion } = useWritingQuestions();
  const router = useRouter();

  const [suggestedQuestion, setSuggestedQuestion] = useState<WritingQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the first unsolved question on component mount
  useEffect(() => {
    const fetchSuggestedQuestion = async () => {
      setLoading(true);
      try {
        const question = await getFirstUnsolvedQuestion();
        setSuggestedQuestion(question);
      } catch (error) {
        console.warn("Failed to fetch suggested question:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedQuestion();
  }, [getFirstUnsolvedQuestion]);

  const handleOnClick = () => {
    if (suggestedQuestion) {
      router.push({
        pathname: "/writing-module/question",
        params: {
          title: suggestedQuestion.name,
          description: suggestedQuestion.full_name,
          id: suggestedQuestion.id,
          level: suggestedQuestion.level,
          scenarios: JSON.stringify(suggestedQuestion.scenarios),
        },
      });
    }
  };

  // Create styles with theme-specific properties
  const styles = createStyles(theme, lightTheme.primaryColor, horizontalScale, verticalScale);

  if (loading) {
    return (
      <TouchableOpacity style={styles.container} disabled>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{t("common.loading")}</Text>
          <Arrow width={horizontalScale(24)} height={verticalScale(24)} />
        </View>
      </TouchableOpacity>
    );
  }

  if (!suggestedQuestion) {
    return (
      <TouchableOpacity style={styles.container} disabled>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{t("modules.writing.allQuestionsCompleted")}</Text>
          <Arrow width={horizontalScale(24)} height={verticalScale(24)} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleOnClick}>
      <View style={styles.itemContainer}>
        <Text style={styles.title}>{suggestedQuestion.name}</Text>
        <Arrow width={horizontalScale(24)} height={verticalScale(24)} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  backgroundColor: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      backgroundColor: backgroundColor, // Using the primary color as background
      borderRadius: 12,
      padding: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: horizontalScale(8),
    },
    title: {
      color:
        theme === "dark" ? darkTheme.textColor : lightTheme.bodyOnPrimaryColor, // White text on primary color background
      fontSize: verticalScale(16),
      fontFamily: "Semibold",
      marginLeft: 8,
    },
  });
