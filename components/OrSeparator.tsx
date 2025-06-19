import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { t } from "i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

interface OrSeparatorProps {
  text?: string;
  containerStyle?: object;
  lineStyle?: object;
  textStyle?: object;
}

export default function OrSeparator({
  containerStyle = {},
  lineStyle = {},
  textStyle = {},
}: OrSeparatorProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

  return (
    <View style={[styles.orContainer, containerStyle]}>
      <View style={[styles.line, lineStyle]} />
      <Text style={[styles.orText, textStyle]}>{t("common.or")}</Text>
      <View style={[styles.line, lineStyle]} />
    </View>
  );
}

const createStyles = (theme: string, screenWidth: number) => {
  // Calculate responsive values based on screen width
  const fontSize = screenWidth * 0.04 > 16 ? 16 : screenWidth * 0.04;
  const marginVertical = screenWidth * 0.025;
  const marginHorizontal = screenWidth * 0.02;

  return StyleSheet.create({
    orContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical,
      width: "100%",
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
    orText: {
      marginHorizontal,
      color: theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      fontSize,
      fontFamily: "Regular",
    },
  });
};
