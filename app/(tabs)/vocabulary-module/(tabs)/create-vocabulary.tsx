import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import OrSeparator from "@/components/OrSeparator";

import CreateVocabIllustrationLight from "@/assets/illustrations/Create Vocab.svg";
import CreateVocabIllustrationDark from "@/assets/illustrations/Create Vocab.svg";
import ReturnButton from "@/components/ReturnButton";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import LevelSelectionBottomSheet from "@/components/LevelSelectionBottomSheet";

export default function CreateVocabScreen() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Ensure navigation bar stays hidden in vocabulary creation
  useNavigationBar();

  const [showLevels, setShowLevels] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Function to open the level selection popup
  const openLevels = (): void => {
    setShowLevels(true);
  };

  // Function to close the level selection popup
  const closeLevels = (): void => {
    setShowLevels(false);
  };

  // Function to select or deselect a language level
  const handleLevelSelect = (level: string): void => {
    setSelectedLevel((prevLevel) => (prevLevel === level ? null : level)); // Toggle selection
  };

  const { t } = useTranslation();

  const levels = [
    t("modules.vocabulary.create.levels.a1"),
    t("modules.vocabulary.create.levels.a2"),
    t("modules.vocabulary.create.levels.b1"),
    t("modules.vocabulary.create.levels.b2"),
    t("modules.vocabulary.create.levels.c1"),
    t("modules.vocabulary.create.levels.c2"),
  ];
  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <ReturnButton />
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          {theme === "dark" ? (
            <CreateVocabIllustrationDark
              width={horizontalScale(350)}
              height={horizontalScale(350)}
            />
          ) : (
            <CreateVocabIllustrationLight
              width={horizontalScale(350)}
              height={horizontalScale(350)}
            />
          )}
        </View>
        {/* Header */}
        <Text style={styles.header}>
          {t("modules.vocabulary.create.title")}
        </Text>
        <View style={styles.buttonContainer}>
          {/* AI Button */}
          <PrimaryButton
            title={t("modules.vocabulary.create.aiCreate")}
            onPress={() => {
              router.navigate("../quiz");
              /* router.navigate({
              pathname: "../quiz/result",
            }); */
            }}
          />

          {/* OR Separator */}
          <OrSeparator />

          {/* Button to open level selection popup */}
          <SecondaryButton
            title={t("modules.vocabulary.create.chooseLevel")}
            onPress={openLevels}
          />
        </View>
        <LevelSelectionBottomSheet
          visible={showLevels}
          onClose={closeLevels}
          levels={levels}
          selectedLevel={selectedLevel}
          onLevelSelect={handleLevelSelect}
          onConfirm={() => {
            closeLevels();
            router.navigate({
              pathname: "../quiz",
              params: {
                level: selectedLevel,
              },
            });
          }}
        />
      </SafeAreaView>
    </ScrollView>
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
      width: "100%",
      fontSize: horizontalScale(28),
      fontFamily: "Semibold",
      marginBottom: verticalScale(20),
      textAlign: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    illustrationContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    buttonContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingHorizontal: horizontalScale(10),
    },
  });
