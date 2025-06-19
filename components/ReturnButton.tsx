import { TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScale } from "@/hooks/useScale";

interface ReturnButtonProps {
  onPress?: () => void;
  style?: object;
  iconSize?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function ReturnButton({
  onPress,
  style,
  iconSize,
  iconName = "arrow-back",
}: ReturnButtonProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
      <TouchableOpacity
        style={[styles.backButton, style]}
        onPress={handlePress}
      >
        <Ionicons
          name={iconName}
          size={iconSize || horizontalScale(20)}
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        />
      </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    backButton: {
      position: "absolute",
      top: verticalScale(30),
      left: horizontalScale(20),
    },
  });
