import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import MainButton from "@/components/MainButton";
import QuickStartButton from "@/components/QuickStartButton";
import SuggestedModuleCard from "@/components/SuggestedModuleCard";
import ProgressChart from "@/components/ProgressChart";
import Leaderboard from "@/components/Leaderboard";
import WeeklyProgress from "@/components/WeeklyProgress";
import { router } from "expo-router";
import { useSuggestedModule } from "@/contexts/SuggestedModuleContext";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { useWeeklyProgress } from "@/contexts/WeeklyProgressContext";
import { useLeaderboard } from "@/contexts/LeaderboardContext";
import { useXP } from "@/contexts/XPContext";
import RepeatDark from "@/assets/icons/Repeat Dark.svg";
import RepeatLight from "@/assets/icons/Repeat Light.svg";

export default function TextScreen() {
  // Ensure navigation bar stays hidden on home screen
  useNavigationBar();

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const { refreshSuggestedModule } = useSuggestedModule();
  const { refreshProgress } = useUserProgress();
  const { refreshWeeklyProgressData } = useWeeklyProgress();
  const { refreshLeaderboard } = useLeaderboard();
  const { fetchXP } = useXP();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const onRefresh = async () => {
    await Promise.all([
      refreshSuggestedModule(),
      refreshProgress(),
      refreshWeeklyProgressData(),
      refreshLeaderboard(),
      fetchXP(),
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header and Buttons */}
      <View style={styles.titleContainer}>
        <Text style={styles.header}>{t("home.title")}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            {theme === "dark" ? <RepeatDark /> : <RepeatLight />}
          </TouchableOpacity>
          <MainButton icon="xp" onPress={() => {}} />
          <MainButton
            icon="settings"
            onPress={() => {
              router.push("/settings");
            }}
          />
        </View>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={[1]}
        renderItem={() => (
          <View>
            {/* Quick Start Buttons */}
            <View style={styles.quickStartContainer}>
              {["pyramid", "vocabulary", "writing", "email"].map((icon) => (
                <View key={icon} style={styles.quickStartButtonWrapper}>
                  <QuickStartButton
                    icon={
                      icon as "pyramid" | "vocabulary" | "writing" | "email"
                    }
                    title={t(`home.modules.${icon}`)}
                  />
                </View>
              ))}
            </View>

            <View style={styles.suggestedModuleContainer}>
              <Text style={styles.suggestedModuleHeader}>
                {t("home.todaysExercise")}
              </Text>
              <SuggestedModuleCard />
            </View>

            <View style={styles.goalAndLeaderboardContainer}>
              <Text style={styles.goalAndLeaderboardHeader}>
                {t("home.weeklyGoalAndLeaderboard")}
              </Text>
              <View style={styles.itemContainer}>
                <View style={styles.chartContainer}>
                  <ProgressChart />
                </View>
                <View style={styles.leaderboardContainer}>
                  <Leaderboard />
                </View>
              </View>
            </View>

            <View style={styles.weeklyProgressContainer}>
              <Text style={styles.goalAndLeaderboardHeader}>
                {t("home.weeklyProgress")}
              </Text>
              <WeeklyProgress />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: horizontalScale(24),
      marginTop: verticalScale(24),
      marginBottom: verticalScale(16),
    },
    header: {
      fontSize: horizontalScale(24),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: horizontalScale(5),
    },
    refreshButton: {
      padding: horizontalScale(8),
      borderRadius: horizontalScale(8),
      backgroundColor: theme === "dark" ? darkTheme.surfaceColor : lightTheme.surfaceColor,
      alignItems: "center",
      justifyContent: "center",
    },
    quickStartContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: horizontalScale(16),
    },
    quickStartButtonWrapper: {
      height: verticalScale(100),
    },
    suggestedModuleContainer: {
      paddingHorizontal: horizontalScale(16),
    },
    suggestedModuleHeader: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(8),
    },
    goalAndLeaderboardContainer: {
      paddingHorizontal: horizontalScale(16),
      marginTop: verticalScale(12),
      height: verticalScale(220),
    },
    goalAndLeaderboardHeader: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    itemContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      height: verticalScale(200),
      marginTop: verticalScale(12),
    },
    chartContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    leaderboardContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    weeklyProgressContainer: {
      paddingHorizontal: horizontalScale(16),
      gap: verticalScale(12),
    },
  });
};
