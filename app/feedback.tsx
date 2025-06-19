import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";
import { useScale } from "@/hooks/useScale";
import ReturnButton from "@/components/ReturnButton";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function FeedbackScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden in feedback screen
  useNavigationBar();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <SafeAreaView style={styles.container}>
      <ReturnButton />
      <Text style={styles.title}>{t("feedback.title")}</Text>
      <Text style={styles.content}>{t("feedback.comingSoon")}</Text>
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
      paddingTop: verticalScale(60),
      paddingHorizontal: horizontalScale(20),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    title: {
      fontSize: horizontalScale(22),
      fontFamily: "Bold",
      textAlign: "center",
      marginVertical: verticalScale(20),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    content: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      textAlign: "center",
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
    },
  });
