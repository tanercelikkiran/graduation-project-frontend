import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useScale } from "@/hooks/useScale";

// Import the SVG icons for stats
import TimeIcon from "@/assets/icons/Time.svg";
import XPIcon from "@/assets/icons/XP Empty.svg";
import SuccessIcon from "@/assets/icons/Success.svg";

interface ResultStatsCardsProps {
  time?: string;
  points?: string | number;
  successRate?: string;
}

export default function ResultStatsCards({
  time = "6m 14s",
  points = 0,
  successRate = "88%",
}: ResultStatsCardsProps) {
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(horizontalScale, verticalScale);

  return (
    <View style={styles.statsContainer}>
      {/* Time Card */}
      <View style={[styles.statCard, { backgroundColor: "#FFB400" }]}>
        <TimeIcon width={horizontalScale(24)} height={verticalScale(24)} />
        <Text style={styles.statValue}>{time}</Text>
        <Text style={styles.statLabel}>
          {t("modules.pyramid.result.time", "Time")}
        </Text>
      </View>

      {/* Points Card */}
      <View style={[styles.statCard, { backgroundColor: "#6C0BBC" }]}>
        <XPIcon width={horizontalScale(24)} height={verticalScale(24)} />
        <Text style={styles.statValue}>{points}</Text>
        <Text style={styles.statLabel}>
          {t("modules.pyramid.result.points", "Points")}
        </Text>
      </View>

      {/* Success Rate Card */}
      <View style={[styles.statCard, { backgroundColor: "#38AD49" }]}>
        <SuccessIcon width={horizontalScale(24)} height={verticalScale(24)} />
        <Text style={styles.statValue}>{successRate}</Text>
        <Text style={styles.statLabel}>
          {t("modules.pyramid.result.successRate", "Success Rate")}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    statsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      paddingHorizontal: horizontalScale(10),
      gap: horizontalScale(16),
    },
    statCard: {
      alignItems: "center",
      justifyContent: "center",
      width: horizontalScale(100),
      height: verticalScale(120),
      borderRadius: horizontalScale(16),
    },
    statValue: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: "white",
      marginTop: verticalScale(8),
      marginBottom: verticalScale(4),
    },
    statLabel: {
      fontSize: horizontalScale(12),
      fontFamily: "Medium",
      color: "white",
      textAlign: "center",
    },
  });
