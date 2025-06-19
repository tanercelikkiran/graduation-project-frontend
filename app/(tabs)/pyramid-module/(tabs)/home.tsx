import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { usePyramidList } from "@/contexts/PyramidListContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import PyramidCard from "@/components/PyramidCard";
import AddButton from "@/components/AddButton";
import SavedElements from "@/components/SavedElements";
import { router } from "expo-router";
import PyramidStats from "@/components/PyramidStats";
import RepeatDark from "@/assets/icons/Repeat Dark.svg";
import RepeatLight from "@/assets/icons/Repeat Light.svg";

export default function PyramidsScreen() {
  const {
    pyramids,
    selectedPyramidId,
    setSelectedPyramidId,
    isLoading,
    fetchUserPyramids,
  } = usePyramidList();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  // Ensure navigation bar stays hidden in pyramid module
  useNavigationBar();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Refresh pyramids when screen is focused
  const onRefresh = async () => {
    await fetchUserPyramids();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.header}>{t("modules.pyramid.title")}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          {theme === "dark" ? <RepeatDark /> : <RepeatLight />}
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <PyramidStats />

      {/* Saved Sentences Section */}
      <SavedElements
        text={t("modules.pyramid.savedSentences")}
        onPress={() => router.navigate("./saved-sentences")}
        useActualSentenceCount={true}
      />

      {/* Pyramid Items */}
      <ScrollView
        style={styles.pyramidItemContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={
              theme === "dark" ? darkTheme.textColor : lightTheme.textColor
            }
          />
        }
      >
        {isLoading && pyramids.length === 0 ? (
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
        ) : pyramids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("modules.pyramid.noPyramids")}
            </Text>
            <Text style={styles.emptySubtext}>
              {t("modules.pyramid.createFirstPyramid")}
            </Text>
          </View>
        ) : (
          pyramids.map((pyramid) => (
            <PyramidCard
              key={pyramid.id}
              isSelected={selectedPyramidId === pyramid.id}
              title={pyramid.title}
              pyramidId={pyramid.id}
              onPress={() => setSelectedPyramidId(pyramid.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Pyramid Button */}
      <AddButton onPress={() => router.navigate("./create-pyramid")} />
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
    },
    pyramidItemContainer: {
      marginBottom: verticalScale(16),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: verticalScale(40),
    },
    loadingText: {
      marginTop: verticalScale(16),
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Regular",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: verticalScale(40),
      paddingHorizontal: horizontalScale(24),
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
    },
  });
