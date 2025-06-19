import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EnglishIcon from "@/assets/flags/England Sign.svg";
import SpanishIcon from "@/assets/flags/Spain Sign.svg";
import TurkishIcon from "@/assets/flags/Turkey Sign.svg";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface FlagButtonProps {
  title: string;
  flag: "english" | "spanish" | "turkish";
  onPress: () => void;
}

export default function FlagButton({ title, flag, onPress }: FlagButtonProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        {flag === "english" && (
          <EnglishIcon width={horizontalScale(40)} height={verticalScale(40)} />
        )}
        {flag === "spanish" && (
          <SpanishIcon width={horizontalScale(40)} height={verticalScale(40)} />
        )}
        {flag === "turkish" && (
          <TurkishIcon width={horizontalScale(40)} height={verticalScale(40)} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{title}</Text>
      </View>
      <Ionicons
        name="arrow-forward"
        size={horizontalScale(20)}
        color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        style={styles.arrowIcon}
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
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      borderRadius: horizontalScale(12),
      paddingVertical: verticalScale(10),
      paddingHorizontal: horizontalScale(10),
      marginVertical: verticalScale(5),
    },
    textContainer: {
      flex: 1,
      alignContent: "center",
      justifyContent: "center",
      marginLeft: horizontalScale(20),
    },
    text: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    arrowIcon: {
      marginLeft: "auto",
    },
  });
