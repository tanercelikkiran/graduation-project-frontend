import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useVocabulary } from "../contexts/VocabularyListContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthenticationContext";
import { router } from "expo-router";

import EnglishFlag from "@/assets/flags/England Sign.svg";
import SpanishFlag from "@/assets/flags/Spain Sign.svg";
import TurkishFlag from "@/assets/flags/Turkey Sign.svg";

import VocabularyLight from "@/assets/icons/Vocabulary Light.svg";
import VocabularyDark from "@/assets/icons/Vocabulary Dark.svg";

import ArrowIconLight from "@/assets/icons/Short Arrow Down Light.svg";
import ArrowIconDark from "@/assets/icons/Short Arrow Down Dark.svg";

import StatisticsIconDark from "@/assets/icons/Statistics Dark.svg";
import StatisticsIconLight from "@/assets/icons/Statistics Light.svg";

import RepeatIconDark from "@/assets/icons/Repeat Dark.svg";
import RepeatIconLight from "@/assets/icons/Repeat Light.svg";

import { Ionicons } from "@expo/vector-icons";
import { useScale } from "@/hooks/useScale";

interface VocabularyCardProps {
  whichIcon: "english" | "spanish" | "turkish" | "vocab";
  isSelected: boolean;
  title: string;
  onPress?: () => void;
}

export default function VocabularyCard({
  whichIcon,
  isSelected,
  title,
  onPress,
}: VocabularyCardProps) {
  const {
    expandedVocabId,
    setExpandedVocabId,
    deleteVocabulary,
    selectedVocabId,
    activeTab,
  } = useVocabulary();
  const animation = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const { token } = useAuth();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const isExpanded = expandedVocabId === title;

  const handlePress = () => {
    if (onPress) {
      onPress();
    }

    if (isSelected) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedVocabId(null);
    } else {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedVocabId(title);
    }
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expandedVocabId]);

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, verticalScale(60)],
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleReworkVocabulary = async () => {
    if (!token || !selectedVocabId) {
      console.log("[Debug] Rework failed: Missing token or selectedVocabId", {
        token: !!token,
        selectedVocabId,
      });
      return;
    }

    try {
      setLoading(true);
      console.log("[Debug] Navigating to quiz with params:", {
        vocabularyListId: selectedVocabId,
        rework: true,
      });

      // Instead of making the request here and navigating directly to the question page,
      // just navigate to the quiz index which will handle the loading and redirection
      router.navigate({
        pathname: "../quiz",
        params: {
          vocabularyListId: selectedVocabId,
          rework: "true", // Add a parameter to indicate this is a rework request
        },
      });
    } catch (error) {
      console.error("[Debug] Error navigating to rework vocabulary:", error);
      Alert.alert(t("errors.title"), t("errors.failedToReworkVocabulary"));
      setLoading(false);
    }
  };

  const handleDeleteVocabulary = () => {
    Alert.alert(
      t("modules.vocabulary.delete.title"),
      t("modules.vocabulary.delete.message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            if (selectedVocabId) {
              // We use the isPopular flag to determine which list to delete from
              const isPopular = activeTab === "popular";
              deleteVocabulary(selectedVocabId, isPopular);
            }
          },
        },
      ]
    );
  };

  const Container = isSelected
    ? ({ children }: { children: React.ReactNode }) => (
        <TouchableOpacity
          style={styles.itemContainerSelected}
          onPress={handlePress}
        >
          {children}
        </TouchableOpacity>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
          {children}
        </TouchableOpacity>
      );

  return (
    <View>
      <Container>
        {whichIcon === "english" && (
          <EnglishFlag width={horizontalScale(30)} height={verticalScale(30)} />
        )}
        {whichIcon === "spanish" && (
          <SpanishFlag width={horizontalScale(30)} height={verticalScale(30)} />
        )}
        {whichIcon === "turkish" && (
          <TurkishFlag width={horizontalScale(30)} height={verticalScale(30)} />
        )}

        {whichIcon === "vocab" &&
          (isSelected ? (
            <VocabularyDark style={styles.iconSelected} />
          ) : theme === "dark" ? (
            <VocabularyDark style={styles.iconPlain} />
          ) : (
            <VocabularyLight style={styles.iconPlain} />
          ))}

        <Text
          style={[styles.title, isSelected && { color: darkTheme.textColor }]}
        >
          {title}
        </Text>

        <View style={styles.iconGroup}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            {isSelected ? (
              <ArrowIconDark style={styles.miniIcon} />
            ) : theme === "dark" ? (
              <ArrowIconDark style={styles.miniIcon} />
            ) : (
              <ArrowIconLight style={styles.miniIcon} />
            )}
          </Animated.View>
        </View>
      </Container>

      <Animated.View
        style={[styles.expandableView, { height: heightInterpolate }]}
      >
        {isExpanded && (
          <ScrollView style={styles.expandedContent}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton}>
                {theme === "dark" ? (
                  <StatisticsIconDark
                    width={horizontalScale(20)}
                    height={verticalScale(20)}
                  />
                ) : (
                  <StatisticsIconLight
                    width={horizontalScale(20)}
                    height={verticalScale(20)}
                  />
                )}
                <Text style={styles.buttonText}>
                  {t("modules.vocabulary.buttons.statistics")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReworkVocabulary}
              >
                {loading ? (
                  <Text style={styles.buttonText}>{t("common.loading")}</Text>
                ) : theme === "dark" ? (
                  <RepeatIconDark
                    width={horizontalScale(20)}
                    height={verticalScale(20)}
                  />
                ) : (
                  <RepeatIconLight
                    width={horizontalScale(20)}
                    height={verticalScale(20)}
                  />
                )}
                <Text style={styles.buttonText}>
                  {t("modules.vocabulary.buttons.rework")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteVocabulary}
              >
                <Ionicons
                  name="trash-outline"
                  size={horizontalScale(20)}
                  color={darkTheme.errorColor}
                />
                <Text style={styles.buttonText}>
                  {t("modules.vocabulary.buttons.delete")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.cardBackgroundColor,
      padding: horizontalScale(12),
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(8),
      marginHorizontal: horizontalScale(16),
    },
    itemContainerSelected: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: darkTheme.primaryColor,
      padding: horizontalScale(12),
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(8),
      marginHorizontal: horizontalScale(16),
    },
    iconSelected: {
      width: horizontalScale(48),
      height: verticalScale(48),
      resizeMode: "center",
    },
    iconPlain: {
      width: horizontalScale(48),
      height: verticalScale(48),
      resizeMode: "center",
    },
    title: {
      flex: 1,
      fontFamily: "Medium",
      fontSize: horizontalScale(18),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginHorizontal: horizontalScale(12),
    },
    titleSelected: {
      color: darkTheme.textColor,
    },
    iconGroup: {
      flexDirection: "column",
      alignItems: "center",
    },
    miniIcon: {
      fontSize: horizontalScale(16),
      marginVertical: verticalScale(4),
    },
    buttonText: {
      fontFamily: "Regular",
      fontSize: horizontalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    expandableView: {
      overflow: "hidden",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      marginHorizontal: horizontalScale(16),
      borderRadius: horizontalScale(8),
      marginBottom: verticalScale(8),
    },
    expandedContent: {
      paddingTop: verticalScale(5),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
    },
    buttonRow: {
      alignContent: "center",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    secondaryButton: {
      borderRadius: horizontalScale(8),
      paddingVertical: verticalScale(8),
      paddingHorizontal: horizontalScale(8),
      alignItems: "center",
      justifyContent: "center",
      flex: 0.225,
    },
    deleteButton: {
      borderRadius: horizontalScale(8),
      paddingVertical: verticalScale(8),
      paddingHorizontal: horizontalScale(8),
      alignItems: "center",
      justifyContent: "center",
      flex: 0.225,
    },
  });
