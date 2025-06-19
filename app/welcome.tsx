import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useScale } from "@/hooks/useScale";

import { lightTheme, darkTheme } from "@/themes/Themes";

import HelloIllustrationLight from "@/assets/illustrations/Hello Light.svg";
import HelloIllustrationDark from "@/assets/illustrations/Hello Dark.svg";

import Logo from "@/assets/icons/Logo.svg";
import AppNameLight from "@/assets/images/App Name Light.svg";
import AppNameDark from "@/assets/images/App Name Dark.svg";

import PrimaryButton from "@/components/PrimaryButton";
import { useTheme } from "@/contexts/ThemeContext";
import TextButton from "@/components/TextButton";
import { useNavigationBar } from "@/hooks/useNavigationBar";

const { width, height } = Dimensions.get("window");
export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden during welcome flow
  useNavigationBar();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo
          width={horizontalScale(40)}
          height={horizontalScale(40)}
          style={styles.logo}
        />
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
          <HelloIllustrationDark
            width={horizontalScale(500)}
            height={verticalScale(500)}
          />
        ) : (
          <HelloIllustrationLight
            width={horizontalScale(500)}
            height={verticalScale(500)}
          />
        )}
      </View>

      {/* Welcome Text */}
      <Text style={styles.header}>{t("welcome.title")}</Text>

      {/* Button */}
      <PrimaryButton
        title={t("welcome.startLearning")}
        onPress={() => router.navigate("/signup")}
      />
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>{t("auth.alreadyHaveAccount")} </Text>
        <TextButton
          title={t("auth.login")}
          onPress={() => router.navigate("/login")}
        />
      </View>
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
      overflow: "visible",
      paddingHorizontal: horizontalScale(16),
    },
    logoContainer: {
      flexDirection: "row", // Align items in a row
      alignItems: "center", // Center vertically
      position: "absolute", // Adds spacing below the container
      top: verticalScale(height * 0.1), // Places the container at the top using verticalScale
      zIndex: 2,
    },
    logo: {},
    header: {
      fontSize: horizontalScale(24),
      fontFamily: "Semibold",
      marginTop: verticalScale(20),
      marginHorizontal: horizontalScale(20),
      textAlign: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    illustrationContainer: {
      zIndex: 1,
      marginTop: verticalScale(30),
      marginBottom: verticalScale(-50),
    },
    linkContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    linkText: {
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
    },
  });
