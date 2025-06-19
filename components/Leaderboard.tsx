import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";

import {
  useLeaderboard,
  LeaderboardItemType,
} from "@/contexts/LeaderboardContext";
import XPIcon from "@/assets/icons/XP Filled.svg";
import { useScale } from "@/hooks/useScale";

const { width, height } = Dimensions.get("window");

type LeaderboardItemProps = LeaderboardItemType;

const LeaderboardItem = ({ rank, username, xp }: LeaderboardItemProps) => {
  const { t } = useTranslation();
  const isYou = username === t("leaderboard.you");

  // Uzun kullanıcı adlarını kısalt
  const maxUsernameLength = 10;
  const displayUsername =
    username.length > maxUsernameLength
      ? username.substring(0, maxUsernameLength) + ".."
      : username;

  const { theme } = useTheme();
  const scaleX = (size: number) => (width / 375) * size;
  const scaleY = (size: number) => (height / 812) * size;

  const styles = createStyles(theme, scaleX, scaleY);

  return (
    <TouchableOpacity
      style={[styles.itemContainer, isYou && styles.youBackground]}
    >
      <Text style={styles.rank}>{rank}.</Text>
      <Text style={styles.username}>{displayUsername}</Text>
      <View style={styles.pointsContainer}>
        <Text style={styles.points}>{xp}</Text>
        <XPIcon width={16} height={16} />
      </View>
    </TouchableOpacity>
  );
};

const Leaderboard = () => {
  const { theme } = useTheme();
  const { leaderboardData, isLoading } = useLeaderboard();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

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

  return (
    <ScrollView style={styles.container}>
      {leaderboardData.map((item) => (
        <LeaderboardItem key={item.rank.toString()} {...item} />
      ))}
    </ScrollView>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      overflow: "hidden",
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      height: verticalScale(100),
    },
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: horizontalScale(180),
      height: verticalScale(45),
      borderRadius: 12,
      paddingHorizontal: horizontalScale(10),
    },
    rank: {
      fontFamily: "Semibold",
      fontSize: horizontalScale(15),
      width: horizontalScale(30),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    username: {
      fontFamily: "Medium",
      fontSize: horizontalScale(13),
      flex: 1,
      textAlign: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    pointsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: horizontalScale(7),
      marginLeft: "auto",
    },
    points: {
      fontFamily: "Medium",
      fontSize: horizontalScale(13),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    youBackground: {
      backgroundColor: theme === "dark" ? "#2C0F44" : "#E9CFFF",
    },
  });

export default Leaderboard;
