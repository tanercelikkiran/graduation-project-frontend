import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import { useScale } from "@/hooks/useScale";

import PrimaryButton from "@/components/PrimaryButton";
import ResultVocabularyLight from "@/assets/illustrations/Result Vocabulary Light.svg";
import ResultVocabularyDark from "@/assets/illustrations/Result Vocabulary Dark.svg";

export default function Result() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const params = useLocalSearchParams();

  // Extract XP earned from params
  const xpEarned = parseInt(params.xpEarned as string) || 0;

  // Ensure navigation bar stays hidden in vocabulary result screen
  useNavigationBar();

  const handleFinish = () => {
    // Navigate back to the vocabulary module main page
    router.replace("../../vocabulary-module");
  };

  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          {theme === "light" ? (
            <ResultVocabularyLight
              width={horizontalScale(400)}
              height={horizontalScale(400)}
            />
          ) : (
            <ResultVocabularyDark
              width={horizontalScale(400)}
              height={horizontalScale(400)}
            />
          )}
        </View>
        <Text style={styles.title}>
          {t(
            "modules.vocabulary.quiz.result.congratulations",
            "Congratulations!"
          )}
        </Text>
        <Text style={styles.description}>
          {t(
            "modules.vocabulary.quiz.result.description",
            "You have completed the vocabulary quiz"
          )}
        </Text>
      </View>

      {/* Return Button */}
      <PrimaryButton
        title={t(
          "modules.vocabulary.quiz.result.backToModules",
          "Return to the main page"
        )}
        onPress={handleFinish}
      />
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
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalScale(24),
    },
    illustrationContainer: {
      marginBottom: verticalScale(20),
      alignItems: "center",
    },
    title: {
      fontSize: horizontalScale(24),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
    },
    description: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
      marginBottom: verticalScale(20),
    },
  });
