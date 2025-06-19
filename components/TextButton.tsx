import React from "react";
import { Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface TextButtonProps {
  title: string;
  onPress: () => void;
}

export default function TextButton({ title, onPress }: TextButtonProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.text}> {title} </Text>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    text: {
      fontFamily: "Regular",
      color:
        theme === "dark"
          ? darkTheme.textButtonColor
          : lightTheme.textButtonColor,
      fontSize: verticalScale(14),
      alignSelf: "center",
    },

    hover: {
      opacity: 0.8,
    },

    active: {
      opacity: 1,
    },

    button: {
      paddingVertical: verticalScale(10),
      paddingHorizontal: horizontalScale(20),
      borderRadius: 5,
      backgroundColor:
        theme === "dark"
          ? darkTheme.textButtonColor
          : lightTheme.textButtonColor,
    },
  });
