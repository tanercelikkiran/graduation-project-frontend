import React from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useWeeklyProgress } from "@/contexts/WeeklyProgressContext";
import { useScale } from "@/hooks/useScale";

export default function WeeklyProgress() {
  const { weeklyProgressData, isLoading } = useWeeklyProgress();
  const { t } = useTranslation();

  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const { width } = Dimensions.get("window");

  const chartConfig = {
    backgroundGradientFrom:
      theme === "dark" ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    backgroundGradientTo:
      theme === "dark" ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) =>
      theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  // Check if data is empty (all zeros or no data)
  const hasData = weeklyProgressData.datasets?.[0]?.data?.some(value => value > 0) || false;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator
          size="small"
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        />
      </View>
    );
  }

  if (!hasData) {
    return (
      <View style={[styles.container, styles.placeholderContainer]}>
        <Text style={styles.placeholderTitle}>
          {t("progress.noData.title")}
        </Text>
        <Text style={styles.placeholderSubtext}>
          {t("progress.noData.subtitle")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={weeklyProgressData}
        width={width}
        height={verticalScale(180)}
        chartConfig={chartConfig}
      />
    </View>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      height: verticalScale(180),
    },
    placeholderContainer: {
      height: verticalScale(180),
      paddingHorizontal: horizontalScale(24),
      backgroundColor: theme === "dark" ? darkTheme.surfaceColor : lightTheme.surfaceColor,
      borderRadius: horizontalScale(12),
      marginHorizontal: horizontalScale(16),
    },
    placeholderTitle: {
      fontSize: horizontalScale(16),
      fontFamily: "Semibold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
      marginBottom: verticalScale(8),
    },
    placeholderSubtext: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.secondaryTextColor : lightTheme.secondaryTextColor,
      textAlign: "center",
      lineHeight: horizontalScale(20),
    },
  });
