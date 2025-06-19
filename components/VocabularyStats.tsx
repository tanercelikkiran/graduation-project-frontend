import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/StatCard";
import { useVocabularyStats } from "../contexts/VocabularyStatsContext";

export default function VocabularyStats() {
  const { stats, error, isLoading } = useVocabularyStats();
  const { t } = useTranslation();
  const time = stats?.time ?? "0";
  const vocabularies = stats?.vocabularies ?? "0";
  const successRate = stats?.successRate ?? "0%";

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <StatCard
          whichIcon="time"
          backgroundColor="#FFB400"
          text={t("modules.vocabulary.stats.time")}
          value={time}
        />
        <StatCard
          whichIcon="vocab"
          backgroundColor="#007AFF"
          text={t("modules.vocabulary.stats.vocabularies")}
          value={vocabularies}
        />
        <StatCard
          whichIcon="success"
          backgroundColor="#38AD49"
          text={t("modules.vocabulary.stats.successRate")}
          value={successRate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    marginHorizontal: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  statusText: {
    color: "blue",
    fontSize: 12,
    marginHorizontal: 10,
    marginBottom: 5,
  },
});
