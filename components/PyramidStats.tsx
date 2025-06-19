import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/StatCard";
import { usePyramidStats } from "../contexts/PyramidStatsContext";
import { useScale } from "@/hooks/useScale";

export default function PyramidStats() {
  const { stats } = usePyramidStats();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(horizontalScale, verticalScale);

  return (
    <View style={styles.statsContainer}>
      <StatCard
        whichIcon="time"
        backgroundColor="#FFB400"
        text={t("modules.pyramid.stats.time")}
        value={stats.time}
      />
      <StatCard
        whichIcon="text"
        backgroundColor="#007AFF"
        text={t("modules.pyramid.stats.sentences")}
        value={stats.sentences}
      />
      <StatCard
        whichIcon="success"
        backgroundColor="#38AD49"
        text={t("modules.pyramid.stats.successRate")}
        value={stats.successRate}
      />
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
      justifyContent: "space-between",
      marginBottom: verticalScale(24),
      marginHorizontal: horizontalScale(10),
    },
  });
