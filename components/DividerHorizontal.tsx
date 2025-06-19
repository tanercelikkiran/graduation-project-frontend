import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
// Yatay Ayırıcı
export default function DividerHorizontal() {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createHorizontalStyles(theme, horizontalScale, verticalScale);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
    </View>
  );
}

// Yatay stil fonksiyonları
const createHorizontalStyles = (
  theme: string,
  horizontalScale: any,
  verticalScale: any
) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: verticalScale(10),
    },
    line: {
      flex: 1,
      height: verticalScale(1),
      backgroundColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
  });
