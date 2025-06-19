import React from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useUserProgress } from "@/contexts/UserProgressContext";

import XPIcon from "@/assets/icons/XP Filled.svg";
import { useScale } from "@/hooks/useScale";

export default function ProgressRing() {
  const { progress, remaining, isLoading, error } = useUserProgress();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const data = {
    labels: ["Progress"],
    data: [progress],
  };

  const chartConfig = {
    backgroundGradientFrom:
      theme === "dark" ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    backgroundGradientTo:
      theme === "dark" ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    color: (opacity = 1) => `rgba(108, 11, 188, 0.50)`,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  // Yükleme ve hata durumlarını kontrol et
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator 
          size="small" 
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressChart
        data={data}
        width={horizontalScale(150)}
        height={horizontalScale(150)}
        radius={Math.ceil(horizontalScale(52) / 2) * 2}
        chartConfig={chartConfig}
        hideLegend={true}
      />
      <View style={styles.absoluteContainer}>
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
        <View style={styles.remainingContainer}>
          <Text style={styles.remainingText}>{remaining}</Text>
          <XPIcon width={16} height={16} />
          <Text style={styles.remainingText}> {t('progress.remained')}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (
  theme: string,
  scaleX: (size: number) => number,
  scaleY: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: scaleY(55),
    },
    absoluteContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      gap: scaleY(40),
      paddingTop: scaleY(20),
    },
    percentage: {
      fontSize: scaleY(24),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    remainingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: scaleY(4),
    },
    remainingText: {
      fontSize: scaleY(14),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    loading: {
      height: scaleY(150),
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      fontSize: scaleY(16),
      width: scaleX(120),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      textAlign: "center",
    },
  });
