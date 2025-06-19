import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import { Ionicons } from "@expo/vector-icons";
import ReturnButton from "@/components/ReturnButton";

interface SavedVocabularyItem {
  word: string;
  meaning: string;
  relevantWords: string[];
  emoji: string;
  saved_at: string;
}

export default function SavedVocabulariesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { token } = useAuth();
  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden in saved vocabularies screen
  useNavigationBar();

  const [savedVocabularies, setSavedVocabularies] = useState<
    SavedVocabularyItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchSavedVocabularies();
  }, [token]);

  const fetchSavedVocabularies = async () => {
    if (!token) {
      setError(t("errors.loginRequired"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/vocabulary/get/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.saved_vocabularies) {
        setSavedVocabularies(response.data.saved_vocabularies);
      } else {
        setSavedVocabularies([]);
      }
    } catch (error) {
      console.error("Error fetching saved vocabularies:", error);
      setError(t("errors.failedToLoadVocabularies"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVocabulary = async (word: string, meaning: string) => {
    try {
      await axios.delete(`${apiUrl}/vocabulary/delete/saved`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { word, meaning },
      });

      // Remove the item from the state
      setSavedVocabularies((prev) =>
        prev.filter((item) => !(item.word === word && item.meaning === meaning))
      );
    } catch (error) {
      console.error("Error removing saved vocabulary:", error);
      setError(t("errors.failedToRemoveVocabulary"));
    }
  };

  const handleToggleFilter = (word: string) => {
    setSelectedFilters((prevFilters) => {
      if (prevFilters.includes(word)) {
        // Remove the word if it's already selected
        return prevFilters.filter((filter) => filter !== word);
      } else {
        // Add the word if it's not selected
        return [...prevFilters, word];
      }
    });
  };

  const handleRemoveFilter = (filter: string) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.filter((item) => item !== filter)
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

  const filteredVocabularies = savedVocabularies.filter((item) => {
    // First apply text search filter
    const matchesSearchText =
      item.word.toLowerCase().includes(searchText.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchText.toLowerCase()) ||
      item.emoji.toLowerCase().includes(searchText.toLowerCase()) ||
      item.relevantWords.some((word) =>
        word.toLowerCase().includes(searchText.toLowerCase())
      );

    // Then apply tag filters if any selected
    const matchesSelectedFilters =
      selectedFilters.length === 0 ||
      selectedFilters.some(
        (filter) => item.relevantWords.includes(filter) || item.word === filter
      );

    return matchesSearchText && matchesSelectedFilters;
  });

  const renderSavedItem = (item: SavedVocabularyItem, index: number) => (
    <View key={`${item.word}-${index}`} style={styles.savedItemContainer}>
      <View style={styles.itemContent}>
        {/* Header row with word and emoji side by side */}
        <View style={styles.headerRow}>
          <Text style={styles.wordText}>{item.word}</Text>
          {item.emoji && <Text style={styles.emojiText}>{item.emoji}</Text>}
        </View>

        <Text style={styles.meaningText}>{item.meaning}</Text>
        {/* Relevant words section */}
        {item.relevantWords && item.relevantWords.length > 0 && (
          <View style={styles.relevantWordsContainer}>
            <Text style={styles.relevantWordsLabel}>
              {t("modules.vocabulary.relevantWords")}:
            </Text>
            <View style={styles.tagsContainer}>
              {item.relevantWords.map((word, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.tagContainer,
                    selectedFilters.includes(word) &&
                      styles.selectedTagContainer,
                  ]}
                  onPress={() => handleToggleFilter(word)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedFilters.includes(word) && styles.selectedTagText,
                    ]}
                  >
                    {word}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveVocabulary(item.word, item.meaning)}
      >
        <Ionicons
          name="trash-outline"
          size={horizontalScale(20)}
          color={
            theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor
          }
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <ReturnButton />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("modules.vocabulary.savedVocabularies")}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={horizontalScale(20)}
          color={
            theme === "dark"
              ? darkTheme.secondaryTextColor
              : lightTheme.secondaryTextColor
          }
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("common.search")}
          placeholderTextColor={
            theme === "dark"
              ? darkTheme.secondaryTextColor
              : lightTheme.secondaryTextColor
          }
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={horizontalScale(20)}
              color={
                theme === "dark"
                  ? darkTheme.secondaryTextColor
                  : lightTheme.secondaryTextColor
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFiltersHeader}>
            <Text style={styles.activeFiltersTitle}>
              {t("common.activeFilters")}
            </Text>
            <TouchableOpacity
              onPress={clearAllFilters}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>
                {t("common.clearAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScrollContainer}
          >
            <View style={styles.activeFiltersRow}>
              {selectedFilters.map((filter, index) => (
                <View key={index} style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>{filter}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveFilter(filter)}
                    style={styles.removeFilterButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={horizontalScale(16)}
                      color={darkTheme.textColor}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={
              theme === "dark" ? darkTheme.textColor : lightTheme.textColor
            }
          />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : savedVocabularies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t("modules.vocabulary.noSavedVocabularies")}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {filteredVocabularies.map((item, index) =>
            renderSavedItem(item, index)
          )}
          {filteredVocabularies.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("common.noSearchResults")}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
    header: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: verticalScale(20),
    },
    headerTitle: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    backButton: {
      padding: horizontalScale(4),
    },
    emptySpace: {
      width: horizontalScale(24), // Match back button size for centering
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(12),
      margin: horizontalScale(16),
      paddingHorizontal: horizontalScale(8),
      minHeight: verticalScale(48), // Adding minimum height for better touch target
    },
    searchIcon: {
      marginRight: horizontalScale(8),
    },
    searchInput: {
      flex: 1,
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      paddingVertical: verticalScale(8), // Adding vertical padding for consistent height
    },
    clearButton: {
      padding: horizontalScale(4),
    },
    activeFiltersContainer: {
      marginHorizontal: horizontalScale(16),
      marginBottom: verticalScale(12),
    },
    activeFiltersHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(8),
    },
    activeFiltersTitle: {
      fontSize: horizontalScale(14),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    clearFiltersButton: {
      padding: horizontalScale(4),
    },
    clearFiltersText: {
      fontSize: horizontalScale(12),
      color: theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor,
      fontFamily: "Medium",
    },
    filtersScrollContainer: {
      flexGrow: 0,
    },
    activeFiltersRow: {
      flexDirection: "row",
      flexWrap: "nowrap",
    },
    activeFilterTag: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor,
      borderRadius: horizontalScale(16),
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      marginRight: horizontalScale(8),
    },
    activeFilterText: {
      fontSize: horizontalScale(14),
      color: "#FFFFFF",
      marginRight: horizontalScale(4),
    },
    removeFilterButton: {
      padding: horizontalScale(2),
    },
    scrollContainer: {
      flex: 1,
      padding: horizontalScale(16),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: horizontalScale(16),
    },
    errorText: {
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: horizontalScale(16),
    },
    emptyText: {
      fontSize: horizontalScale(16),
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      textAlign: "center",
    },
    savedItemContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlueColor
          : lightTheme.surfaceBlueColor,
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(12),
      padding: horizontalScale(16),
    },
    itemContent: {
      flex: 1,
    },
    headerRow: {
      flexDirection: "row",
      gap: horizontalScale(15),
      alignItems: "center",
    },
    wordText: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    meaningText: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
    },
    emojiText: {
      fontSize: horizontalScale(20),
    },
    relevantWordsContainer: {
      marginTop: verticalScale(8),
    },
    relevantWordsLabel: {
      fontSize: horizontalScale(14),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: verticalScale(4),
    },
    tagContainer: {
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(8),
      paddingHorizontal: horizontalScale(8),
      paddingVertical: verticalScale(4),
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(4),
    },
    selectedTagContainer: {
      backgroundColor:
        theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor,
    },
    tagText: {
      fontSize: horizontalScale(12),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    selectedTagText: {
      color: "#FFFFFF",
    },
  });
