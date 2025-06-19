import React from "react";
import { router } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

import Logo from "@/assets/icons/Logo.svg";
import AppNameLight from "@/assets/images/App Name Light.svg";
import AppNameDark from "@/assets/images/App Name Dark.svg";
import StartIllustrationLight from "@/assets/illustrations/Start Light.svg";
import StartIllustrationDark from "@/assets/illustrations/Start Dark.svg";

import PrimaryButton from "@/components/PrimaryButton";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Ensure navigation bar stays hidden during start screen
  useNavigationBar();

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo width={horizontalScale(40)} height={verticalScale(40)} />
        {theme === "dark" ? (
          <AppNameDark
            width={horizontalScale(200)}
            height={verticalScale(40)}
          />
        ) : (
          <AppNameLight
            width={horizontalScale(200)}
            height={verticalScale(40)}
          />
        )}
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        {theme === "dark" ? (
          <StartIllustrationDark
            width={horizontalScale(450)}
            height={verticalScale(450)}
          />
        ) : (
          <StartIllustrationLight
            width={horizontalScale(450)}
            height={verticalScale(450)}
          />
        )}
      </View>

      {/* Welcome Text */}
      <Text style={styles.header}>{t("start.title")}</Text>
      <Text style={styles.subHeader}>{t("start.subtitle")}</Text>

      {/* Button */}
      <PrimaryButton
        title={t("start.button")}
        onPress={() => {
          router.replace("/home"); // Replaces current screen, preventing back navigation
        }}
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
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
      paddingHorizontal: horizontalScale(20),
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      position: "absolute",
      top: verticalScale(70),
      zIndex: 2,
    },
    illustrationContainer: {
      zIndex: 1,
      marginTop: verticalScale(30),
      marginBottom: verticalScale(20),
      marginLeft: horizontalScale(30),
    },
    header: {
      fontSize: horizontalScale(24),
      fontFamily: "Semibold",
      marginBottom: verticalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    subHeader: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      marginBottom: verticalScale(20),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
  });
