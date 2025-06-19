import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function index() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  // Ensure navigation bar stays hidden in email module
  useNavigationBar();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>{t("modules.email.comingSoon.title")}</Text>
      <Text style={styles.text}>
        {t("modules.email.comingSoon.description")}
      </Text>
    </SafeAreaView>
  );
}

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    text: {
      fontSize: 20,
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
  });
