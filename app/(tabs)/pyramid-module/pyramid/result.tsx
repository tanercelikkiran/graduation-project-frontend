import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import { useScale } from "@/hooks/useScale";
import { useXP } from "@/contexts/XPContext";

import PrimaryButton from "@/components/PrimaryButton";
import ResultIllustrationLight from "@/assets/illustrations/Result Pyramid Light.svg";
import ResultIllustrationDark from "@/assets/illustrations/Result Pyramid Dark.svg";

export default function ResultPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const { addXP } = useXP();
  const params = useLocalSearchParams();

  // Extract completion data from params
  const xpEarned = parseInt(params.xpEarned as string) || 0;
  const completionTime = (params.completionTime as string) || "5m 30s";
  const successRate = (params.successRate as string) || "100%";

  // Ensure navigation bar stays hidden in pyramid result screen
  useNavigationBar();

  // XP is already awarded by the backend event system, no need to add it again
  // useEffect(() => {
  //   if (xpEarned > 0) {
  //     addXP(xpEarned);
  //   }
  // }, [xpEarned, addXP]);

  const handleFinish = () => {
    // Navigate back to the pyramid module main page
    router.replace("../../pyramid-module");
  };

  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          {theme === "light" ? (
            <ResultIllustrationLight
              width={horizontalScale(400)}
              height={horizontalScale(400)}
            />
          ) : (
            <ResultIllustrationDark
              width={horizontalScale(400)}
              height={horizontalScale(400)}
            />
          )}
        </View>
        <Text style={styles.title}>
          {t("modules.pyramid.result.congratulations")}
        </Text>
        <Text style={styles.description}>
          {t("modules.pyramid.result.description")}
        </Text>
      </View>

      {/* Return Button */}
      <PrimaryButton
        title={t("modules.pyramid.result.backToModules")}
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
