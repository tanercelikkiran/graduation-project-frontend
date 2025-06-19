import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import BookmarkIconLight from "@/assets/icons/Bookmark Empty Light.svg";
import BookmarkIconDark from "@/assets/icons/Bookmark Empty Dark.svg";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useSavedSentences } from "@/contexts/SavedSentencesContext";

interface SavedElementsProps {
  text: string;
  count?: number;
  onPress?: () => void;
  useActualSentenceCount?: boolean; // New prop to determine if we should use actual saved sentence count
}

export default function SavedElements({
  text,
  count = 0,
  onPress,
  useActualSentenceCount = false,
}: SavedElementsProps) {
  const { theme } = useTheme();
  const { savedSentencesCount } = useSavedSentences();

  const { horizontalScale, verticalScale } = useScale();

  // Dahili stilleri oluşturuyoruz
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handlePress = () => {
    if (onPress) onPress();
  };

  // Determine which count to use
  const displayCount = useActualSentenceCount ? savedSentencesCount : count;

  return (
    <TouchableOpacity style={styles.vocabContainer} onPress={handlePress}>
      {theme === "dark" ? (
        <BookmarkIconDark width={horizontalScale(24)} height={verticalScale(24)} />
      ) : (
        <BookmarkIconLight width={horizontalScale(24)} height={verticalScale(24)} />
      )}
      <Text style={styles.vocabText}>{text}</Text>
      <Text style={styles.vocabCount}>{displayCount}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    vocabContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlueColor
          : lightTheme.surfaceBlueColor,
      padding: horizontalScale(14),
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(16),
      marginHorizontal: horizontalScale(16),
    },
    vocabText: {
      flex: 1,
      fontSize: horizontalScale(18),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      alignSelf: "center",
      marginLeft: horizontalScale(16),
    },
    vocabCount: {
      fontSize: horizontalScale(15),
      fontFamily: "SemiBold",
      color: "#007AFF",
    },
  });
