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

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import {
  useSavedSentences,
  SavedSentence,
} from "@/contexts/SavedSentencesContext";

import { Ionicons } from "@expo/vector-icons";
import ReturnButton from "@/components/ReturnButton";

export default function SavedSentencesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const {
    savedSentences,
    isLoading,
    error,
    unsaveSentence,
    fetchSavedSentences,
  } = useSavedSentences();

  // Ensure navigation bar stays hidden in saved sentences screen
  useNavigationBar();

  const [searchText, setSearchText] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const styles = createStyles(theme, horizontalScale, verticalScale);

  useEffect(() => {
    fetchSavedSentences();
  }, [fetchSavedSentences]);

  const handleRemoveSentence = async (sentence: string, meaning: string) => {
    try {
      await unsaveSentence(sentence, meaning);
    } catch (error) {
      console.error("Error removing saved sentence:", error);
    }
  };

  const handleToggleFilter = (transformationType: string) => {
    setSelectedFilters((prevFilters) => {
      if (prevFilters.includes(transformationType)) {
        // Remove the type if it's already selected
        return prevFilters.filter((filter) => filter !== transformationType);
      } else {
        // Add the type if it's not selected
        return [...prevFilters, transformationType];
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

  const filteredSentences = savedSentences.filter((item) => {
    // First apply text search filter
    const matchesSearchText =
      item.sentence.toLowerCase().includes(searchText.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchText.toLowerCase()) ||
      item.transformation_type.toLowerCase().includes(searchText.toLowerCase());

    // Then apply transformation type filters if any selected
    const matchesSelectedFilters =
      selectedFilters.length === 0 ||
      selectedFilters.includes(item.transformation_type);

    return matchesSearchText && matchesSelectedFilters;
  });

  // Get unique transformation types for filter options
  const uniqueTransformationTypes = Array.from(
    new Set(savedSentences.map((item) => item.transformation_type))
  );

  const getTransformationTypeColor = (type: string) => {
    switch (type) {
      case "expand":
        return "#4CAF50"; // Green
      case "shrink":
        return "#F44336"; // Red
      case "replace":
        return "#2196F3"; // Blue
      case "paraphrase":
        return "#9C27B0"; // Purple
      default:
        return theme === "dark"
          ? darkTheme.accentColor
          : lightTheme.accentColor;
    }
  };

  const renderSavedItem = (item: SavedSentence, index: number) => (
    <View key={`${item.sentence}-${index}`} style={styles.savedItemContainer}>
      <View style={styles.itemContent}>
        {/* Header row with transformation type badge */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.transformationBadge,
              {
                backgroundColor: getTransformationTypeColor(
                  item.transformation_type
                ),
              },
            ]}
          >
            <Text style={styles.transformationText}>
              {item.transformation_type.charAt(0).toUpperCase() +
                item.transformation_type.slice(1)}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.saved_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Sentence text */}
        <Text style={styles.sentenceText} numberOfLines={3}>
          {item.sentence}
        </Text>

        {/* Meaning text */}
        <Text style={styles.meaningText} numberOfLines={2}>
          {item.meaning}
        </Text>

        {/* Source sentence if different from main sentence */}
        {item.source_sentence && item.source_sentence !== item.sentence && (
          <View style={styles.sourceSentenceContainer}>
            <Text style={styles.sourceSentenceLabel}>
              {t("modules.pyramid.originalSentence")}:
            </Text>
            <Text style={styles.sourceSentenceText} numberOfLines={2}>
              {item.source_sentence}
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveSentence(item.sentence, item.meaning)}
        style={styles.deleteButton}
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
          {t("modules.pyramid.savedSentences")}
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

      {/* Transformation Type Filters */}
      {uniqueTransformationTypes.length > 0 && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>
            {t("modules.pyramid.filterByType")}:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScrollContainer}
          >
            <View style={styles.filtersRow}>
              {uniqueTransformationTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterChip,
                    selectedFilters.includes(type) && styles.selectedFilterChip,
                    { borderColor: getTransformationTypeColor(type) },
                    selectedFilters.includes(type) && {
                      backgroundColor: getTransformationTypeColor(type),
                    },
                  ]}
                  onPress={() => handleToggleFilter(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilters.includes(type) &&
                        styles.selectedFilterChipText,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

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
                <View
                  key={index}
                  style={[
                    styles.activeFilterTag,
                    { backgroundColor: getTransformationTypeColor(filter) },
                  ]}
                >
                  <Text style={styles.activeFilterText}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveFilter(filter)}
                    style={styles.removeFilterButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={horizontalScale(16)}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {isLoading ? (
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
      ) : savedSentences.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t("modules.pyramid.noSavedSentences")}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {filteredSentences.map((item, index) => renderSavedItem(item, index))}
          {filteredSentences.length === 0 && (
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
      flexDirection: "row",
    },
    headerTitle: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
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
      minHeight: verticalScale(48),
    },
    searchIcon: {
      marginRight: horizontalScale(8),
    },
    searchInput: {
      flex: 1,
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      paddingVertical: verticalScale(8),
    },
    clearButton: {
      padding: horizontalScale(4),
    },
    filtersContainer: {
      marginHorizontal: horizontalScale(16),
      marginBottom: verticalScale(12),
    },
    filtersTitle: {
      fontSize: horizontalScale(14),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(8),
    },
    filtersScrollContainer: {
      flexGrow: 0,
    },
    filtersRow: {
      flexDirection: "row",
      flexWrap: "nowrap",
    },
    filterChip: {
      borderWidth: 1,
      borderRadius: horizontalScale(16),
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      marginRight: horizontalScale(8),
      backgroundColor: "transparent",
    },
    selectedFilterChip: {
      // backgroundColor is set dynamically
    },
    filterChipText: {
      fontSize: horizontalScale(12),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    selectedFilterChipText: {
      color: "#FFFFFF",
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
    activeFiltersRow: {
      flexDirection: "row",
      flexWrap: "nowrap",
    },
    activeFilterTag: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: horizontalScale(16),
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      marginRight: horizontalScale(8),
    },
    activeFilterText: {
      fontSize: horizontalScale(12),
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
      alignItems: "flex-start",
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
      marginRight: horizontalScale(12),
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(8),
    },
    transformationBadge: {
      borderRadius: horizontalScale(12),
      paddingHorizontal: horizontalScale(8),
      paddingVertical: verticalScale(4),
    },
    transformationText: {
      fontSize: horizontalScale(12),
      fontFamily: "Bold",
      color: "#FFFFFF",
    },
    dateText: {
      fontSize: horizontalScale(12),
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
    },
    sentenceText: {
      fontSize: horizontalScale(16),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(4),
    },
    meaningText: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      marginBottom: verticalScale(8),
    },
    sourceSentenceContainer: {
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(8),
      padding: horizontalScale(8),
      marginTop: verticalScale(4),
    },
    sourceSentenceLabel: {
      fontSize: horizontalScale(12),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(4),
    },
    sourceSentenceText: {
      fontSize: horizontalScale(12),
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
    },
    deleteButton: {
      padding: horizontalScale(4),
    },
  });
