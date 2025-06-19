import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import { SvgProps } from "react-native-svg";

import { useTheme } from "@/contexts/ThemeContext";
import { useXP } from "@/contexts/XPContext";

// Import all SVG icons
import XPIconFilled from "@/assets/icons/XP Filled.svg";
import SettingsIconLight from "@/assets/icons/Settings Light.svg";
import SettingsIconDark from "@/assets/icons/Settings Dark.svg";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface MainButtonProps {
  icon: string;
  onPress: () => void;
}

export default function MainButton({ icon, onPress }: MainButtonProps) {
  const { theme } = useTheme();
  const { xp } = useXP();
  const { horizontalScale, verticalScale } = useScale();

  // Determine the background color based on icon type and theme
  const getBackgroundColor = (iconType: string): string => {
    switch (iconType) {
      case "xp":
        return theme === "dark" ? "#2C0F44" : "#E9CFFF";
      case "settings":
        return theme === "dark" ? "#00254C" : "#E5F2FF";
      default:
        return theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor;
    }
  };

  // Get the selected icon component based on icon type and theme
  const getIconComponent = (): React.FC<SvgProps> | null => {
    switch (icon) {
      case "xp":
        return XPIconFilled;
      case "settings":
        return theme === "dark" ? SettingsIconDark : SettingsIconLight;
      default:
        return null;
    }
  };

  const IconComponent = getIconComponent();
  const backgroundColor = getBackgroundColor(icon);

  const styles = createStyles(
    theme,
    backgroundColor,
    horizontalScale,
    verticalScale
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={onPress}>
        {IconComponent && <IconComponent />}
        {icon === "xp" && <Text style={styles.xpAmount}>{String(xp)}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (
  theme: string,
  backgroundColor: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    iconContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: backgroundColor,
      borderRadius: horizontalScale(10),
      height: verticalScale(36),
      padding: horizontalScale(10),
    },
    xpAmount: {
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Medium",
      fontSize: horizontalScale(12),
      lineHeight: verticalScale(20),
    },
  });
