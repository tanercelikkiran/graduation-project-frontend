import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface ButtonWithIconProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  width?: number;
  height?: number;
  fontSize?: number;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ButtonWithIcon({
  title,
  icon,
  width = 300,
  height = 50,
  fontSize = 15,
  onPress,
  selected = false,
  disabled = false,
}: ButtonWithIconProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(
    theme,
    horizontalScale,
    verticalScale,
    width,
    height,
    fontSize
  );
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer,
        disabled && styles.disabledContainer,
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 0.6 : 0.2}
      disabled={disabled}
    >
      <View style={styles.itemContainer}>
        <View style={styles.iconContainer}>
          {icon && (
            <Ionicons
              name={icon}
              size={horizontalScale(20)}
              style={{
                color: disabled
                  ? theme === "dark"
                    ? darkTheme.disabledColor
                    : lightTheme.disabledColor
                  : selected
                  ? theme === "dark"
                    ? darkTheme.accentColor
                    : lightTheme.accentColor
                  : theme === "dark"
                  ? darkTheme.textColor
                  : lightTheme.textColor,
              }}
            />
          )}
        </View>
        <Text
          style={[
            styles.text,
            selected && styles.selectedText,
            disabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number,
  width: number,
  height: number,
  fontSize: number
) =>
  StyleSheet.create({
    container: {
      width: horizontalScale(width),
      height: verticalScale(height),
      flexDirection: "row",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(12),
      marginVertical: verticalScale(5),
      alignItems: "center",
      justifyContent: "center",
    },
    selectedContainer: {
      borderWidth: 2,
      borderColor:
        theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor,
    },
    disabledContainer: {
      opacity: 0.5,
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceDisabledColor || darkTheme.surfaceBlackColor
          : lightTheme.surfaceDisabledColor || lightTheme.surfaceWhiteColor,
    },
    itemContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    text: {
      fontSize: horizontalScale(fontSize),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginLeft: horizontalScale(10),
    },
    selectedText: {
      color: theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor,
    },
    disabledText: {
      color:
        theme === "dark"
          ? darkTheme.disabledColor || "rgba(255, 255, 255, 0.4)"
          : lightTheme.disabledColor || "rgba(0, 0, 0, 0.4)",
    },
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
  });
