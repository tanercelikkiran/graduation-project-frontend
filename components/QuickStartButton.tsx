import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";

import PyramidEmptyDark from "@/assets/icons/Pyramid Empty Dark.svg";
import VocabularyEmptyDark from "@/assets/icons/Vocabulary Dark.svg";
import WritingEmptyDark from "@/assets/icons/Writing Empty Dark.svg";
import EmailEmptyDark from "@/assets/icons/Email Empty Dark.svg";
import { useScale } from "@/hooks/useScale";

// Module configuration map - all module-specific data in one place
const MODULE_CONFIG = {
  pyramid: {
    icon: PyramidEmptyDark,
    color: "#FFB400",
    route: "/pyramid-module/home" as const,
  },
  vocabulary: {
    icon: VocabularyEmptyDark,
    color: "#007AFF",
    route: "/vocabulary-module/home" as const,
  },
  writing: {
    icon: WritingEmptyDark,
    color: "#D53F36",
    route: "/writing-module" as const,
  },
  email: {
    icon: EmailEmptyDark,
    color: "#38AC49",
    route: "/email-module" as const,
  },
};

type ModuleType = keyof typeof MODULE_CONFIG;

type QuickStartButtonProps = {
  icon: ModuleType;
  title?: string;
};

export default function QuickStartButton({
  icon,
  title,
}: QuickStartButtonProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  // Get module configuration or default to placeholder values
  const moduleConfig = MODULE_CONFIG[icon] || {
    icon: null,
    color: "#FFFFFF",
    route: "/" as const,
  };

  const styles = createStyles(
    theme,
    moduleConfig.color,
    horizontalScale,
    verticalScale
  );
  const IconComponent = moduleConfig.icon;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => router.push(moduleConfig.route)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {IconComponent && (
            <IconComponent
              width={horizontalScale(24)}
              height={verticalScale(24)}
            />
          )}
        </View>
      </TouchableOpacity>
      <Text style={styles.text}>{title || icon}</Text>
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
      alignItems: "center",
      margin: horizontalScale(8),
    },
    buttonContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: verticalScale(16),
      borderRadius: verticalScale(12),
      width: horizontalScale(56),
      height: verticalScale(56),
      backgroundColor: backgroundColor,
      marginBottom: verticalScale(3),
    },
    iconContainer: {
      width: verticalScale(40),
      height: verticalScale(40),
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontSize: verticalScale(12),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
    },
  });
