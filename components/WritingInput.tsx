import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Text,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface WritingInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function WritingInput({
  value,
  onChangeText,
  placeholder = "Write your answer here...",
  minHeight = 200,
}: WritingInputProps) {
  const { theme } = useTheme();
  const themeColors = theme === "dark" ? darkTheme : lightTheme;
  const { horizontalScale, verticalScale } = useScale();

  const [isFocused, setIsFocused] = useState(false);

  // Calculate word count directly from the value prop, no need for separate state
  const calculateWordCount = (text: string): number => {
    if (!text) return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Get the current word count directly from the value prop
  const currentWordCount = calculateWordCount(value);

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textColor}
        style={[
          styles.input,
          {
            borderColor: isFocused
              ? themeColors.primaryColor
              : themeColors.borderColor,
            color: themeColors.textColor,
            backgroundColor: themeColors.backgroundColor,
            minHeight: verticalScale(minHeight),
          },
        ]}
        multiline={true}
        textAlignVertical="top"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <View style={styles.wordCountContainer}>
        <Text style={[styles.wordCount, { color: themeColors.textColor }]}>
          {currentWordCount} words
        </Text>
      </View>
    </View>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderRadius: 8,
      padding: horizontalScale(12),
      fontFamily: "Regular",
      fontSize: horizontalScale(16),
      textAlignVertical: "top",
    },
    wordCountContainer: {
      alignItems: "flex-end",
      marginTop: verticalScale(8),
    },
    wordCount: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
    },
  });
