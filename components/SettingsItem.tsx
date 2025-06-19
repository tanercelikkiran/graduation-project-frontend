import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface SettingsItemProps {
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  isLogout?: boolean;
}

export default function SettingsItem({
  title,
  onPress,
  showChevron = true,
  isLogout = false,
}: SettingsItemProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale, isLogout);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={horizontalScale(20)}
          color={
            theme === "dark" ? darkTheme.textColor : lightTheme.textColor
          }
        />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number,
  isLogout: boolean
) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: verticalScale(15),
      paddingHorizontal: horizontalScale(16),
      backgroundColor:
        theme === "dark" 
          ? darkTheme.surfaceBlackColor 
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(8),
    },
    title: {
      fontFamily: "Medium",
      fontSize: horizontalScale(16),
      color: isLogout
        ? darkTheme.errorColor
        : theme === "dark"
        ? darkTheme.textColor
        : lightTheme.textColor,
    },
  });