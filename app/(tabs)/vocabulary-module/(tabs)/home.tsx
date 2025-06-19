import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import axios from "axios";

import { useTheme } from "@/contexts/ThemeContext";
import { useVocabulary } from "@/contexts/VocabularyListContext";
import { useVocabularyStats } from "@/contexts/VocabularyStatsContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import VocabularyCard from "@/components/VocabularyCard";
import VocabularyStats from "@/components/VocabularyStats";
import SavedElements from "@/components/SavedElements";
import TabButtons from "@/components/TabButtons";
import { SafeAreaView } from "react-native-safe-area-context";
import AddButton from "@/components/AddButton";
import { router } from "expo-router";
import RepeatDark from "@/assets/icons/Repeat Dark.svg";
import RepeatLight from "@/assets/icons/Repeat Light.svg";

export default function VocabScreen() {
  // Ensure navigation bar stays hidden in vocabulary module
  useNavigationBar();

  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const {
    popularVocabularies,
    yourVocabularies,
    selectedVocabId,
    activeTab,
    setSelectedVocabId,
    setActiveTab,
    refreshAllVocabularies,
    isLoading,
  } = useVocabulary();
  const { refreshStats } = useVocabularyStats();
  const { token } = useAuth();
  const [savedWordsCount, setSavedWordsCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const currentVocabularies =
    activeTab === "popular" ? popularVocabularies : yourVocabularies;

  const { t } = useTranslation();

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // Fetch saved vocabularies count on mount
  useEffect(() => {
    fetchSavedVocabulariesCount();
  }, [token]);

  const tabs = [
    { id: "popular", label: t("modules.vocabulary.tabs.popular") },
    { id: "your", label: t("modules.vocabulary.tabs.your") },
  ];

  const fetchSavedVocabulariesCount = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/vocabulary/get/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.saved_vocabularies) {
        setSavedWordsCount(response.data.saved_vocabularies.length);
      }
    } catch (error) {
      console.error("Error fetching saved vocabularies count:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshAllVocabularies(),
        refreshStats(),
        fetchSavedVocabulariesCount(),
      ]);
    } catch (error) {
      console.error("Error refreshing vocabulary data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.header}>{t("modules.vocabulary.title")}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          {theme === "dark" ? <RepeatDark /> : <RepeatLight />}
        </TouchableOpacity>
      </View>

      {/* Statistics Section */}
      <VocabularyStats />

      {/* Saved Vocabularies Section */}
      <SavedElements
        text={t("modules.vocabulary.saved")}
        count={savedWordsCount}
        onPress={() => router.navigate("./saved-vocabularies")}
      />

      {/* Tab Buttons */}
      <TabButtons
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          if (tab === "popular" || tab === "your") {
            setActiveTab(tab);
          }
        }}
        tabs={tabs}
      />

      {/* Vocabulary Items */}
      <ScrollView
        style={styles.vocabularyItemContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={
              theme === "dark" ? darkTheme.textColor : lightTheme.textColor
            }
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={
                theme === "dark"
                  ? darkTheme.primaryColor
                  : lightTheme.primaryColor
              }
            />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        ) : currentVocabularies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "popular"
                ? t("modules.vocabulary.noPopularVocabularies")
                : t("modules.vocabulary.noYourVocabularies")}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "popular"
                ? t("modules.vocabulary.noPopularVocabulariesSubtext")
                : t("modules.vocabulary.noYourVocabulariesSubtext")}
            </Text>
          </View>
        ) : (
          currentVocabularies.map((vocab) => (
            <VocabularyCard
              whichIcon={vocab.whichIcon}
              key={vocab.id}
              title={vocab.title}
              isSelected={selectedVocabId === vocab.id}
              onPress={() => setSelectedVocabId(vocab.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Pyramid Button */}
      <AddButton onPress={() => router.navigate("./create-vocabulary")} />
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
    refreshButton: {
      padding: horizontalScale(8),
      borderRadius: horizontalScale(8),
      alignItems: "center",
      justifyContent: "center",
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
      marginHorizontal: 10,
    },
    vocabContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlueColor
          : lightTheme.surfaceBlueColor,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      marginHorizontal: 16,
    },
    vocabularyItemContainer: {
      marginBottom: verticalScale(16),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: verticalScale(50),
    },
    loadingText: {
      marginTop: verticalScale(10),
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: verticalScale(50),
      marginHorizontal: horizontalScale(24),
    },
    emptyText: {
      fontSize: horizontalScale(18),
      fontFamily: "Semibold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
      marginBottom: verticalScale(8),
    },
    emptySubtext: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
      lineHeight: horizontalScale(20),
    },
  });
