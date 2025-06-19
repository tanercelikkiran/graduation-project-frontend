import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";

// Import Icons
import BeginnerIcon from "@/assets/icons/Beginner.svg";
import ElementaryIcon from "@/assets/icons/Elementary.svg";
import IntermediateIcon from "@/assets/icons/Intermediate.svg";
import AdvancedIcon from "@/assets/icons/Advanced.svg";

// Import CircularProgress component
import CircularProgress from "./CircularProgress";
import { useRouter } from "expo-router";
import { useScale } from "@/hooks/useScale";
import { useWritingQuestions } from "@/hooks/useWriting";
import { useEffect } from "react";

// Level information mapping
const levelInfo = {
  beginner: {
    icon: BeginnerIcon,
    color: "#38AD49",
  },
  elementary: {
    icon: ElementaryIcon,
    color: "#FFB400",
  },
  intermediate: {
    icon: IntermediateIcon,
    color: "#D53F36",
  },
  advanced: {
    icon: AdvancedIcon,
    color: "#6C0BBC",
  },
};

export default function LevelSelection() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const { availableLevels, progress, fetchProgress } = useWritingQuestions();

  const [levels] = useState([
    {
      id: 1,
      name: "beginner",
    },
    {
      id: 2,
      name: "elementary",
    },
    {
      id: 3,
      name: "intermediate",
    },
    {
      id: 4,
      name: "advanced",
    },
  ]);

  const router = useRouter();

  // Fetch progress for all levels on component mount
  useEffect(() => {
    levels.forEach(level => {
      fetchProgress(level.name);
    });
  }, [fetchProgress]);

  const handleLevelSelect = (levelId: number) => {
    const selectedLevel = levels.find((level) => level.id === levelId);
    if (selectedLevel) {
      router.navigate({
        pathname: `/writing-module/questions`,
        params: {
          level: selectedLevel.name,
        },
      });
    }
  };

  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <View>
      <View style={styles.gridContainer}>
        {levels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.gridItem,
              {
                backgroundColor:
                  levelInfo[level.name as keyof typeof levelInfo].color,
              },
            ]}
            onPress={() => handleLevelSelect(level.id)}
            activeOpacity={0.8}
          >
            <CircularProgress
              size={horizontalScale(25)}
              strokeWidth={3}
              progress={progress[level.name]?.solved || 0}
              total={progress[level.name]?.total || 0}
              color="#FFFFFF"
            />
            <View style={styles.iconContainer}>
              {React.createElement(
                levelInfo[level.name as keyof typeof levelInfo].icon
              )}
            </View>
            <Text style={styles.levelName}>
              {t(`modules.writing.${level.name}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Styles
const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    header: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(16),
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    gridItem: {
      width: "48%",
      aspectRatio: 1,
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(16),
      padding: horizontalScale(16),
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    levelName: {
      color: "#FFFFFF",
      fontSize: horizontalScale(14),
      fontFamily: "Medium",
      marginTop: verticalScale(10),
      textTransform: "capitalize",
    },
  });
