import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
// Dikey Ayırıcı
export default function DividerVertical() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createVerticalStyles(theme, horizontalScale, verticalScale);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
    </View>
  );
}

// Dikey stil fonksiyonları
const createVerticalStyles = (
  theme: string,
  horizontalScale: any,
  verticalScale: any
) =>
  StyleSheet.create({
    container: {
      flexDirection: "column",
      alignItems: "center",
      marginHorizontal: horizontalScale(10),
    },
    line: {
      flex: 1,
      width: horizontalScale(1),
      backgroundColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
  });
