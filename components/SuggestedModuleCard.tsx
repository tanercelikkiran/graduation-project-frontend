import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { useSuggestedModule } from "@/contexts/SuggestedModuleContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

import PyramidFilledDark from "@/assets/icons/Pyramid Filled Dark.svg";
import VocabularyFilledDark from "@/assets/icons/Vocabulary Dark.svg";
import WritingFilledDark from "@/assets/icons/Writing Filled Dark.svg";
import EmailFilledDark from "@/assets/icons/Email Filled Dark.svg";

import ArrowDark from "@/assets/icons/Short Arrow Right Dark.svg";

import { router } from "expo-router";
import { useScale } from "@/hooks/useScale";

// Module configuration map - all module-specific data in one place
const MODULE_CONFIG = {
  pyramid: {
    icon: PyramidFilledDark,
    textKey: "home.modules.pyramid",
    color: "#FFB400",
    route: "./pyramid-module" as const,
  },
  vocabulary: {
    icon: VocabularyFilledDark,
    textKey: "home.modules.vocabulary",
    color: "#007AFF",
    route: "./vocabulary-module" as const,
  },
  writing: {
    icon: WritingFilledDark,
    textKey: "home.modules.writing",
    color: "#D53F36",
    route: "./writing-module" as const,
  },
  email: {
    icon: EmailFilledDark,
    textKey: "home.modules.email",
    color: "#38AC49",
    route: "./email-module" as const,
  },
};

export default function SuggestedModuleCard() {
  const { suggestedModule: moduleType, loading } = useSuggestedModule();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();

  const { horizontalScale, verticalScale } = useScale();

  // Get module configuration or default to placeholder values
  const moduleConfig = MODULE_CONFIG[moduleType] || {
    icon: null,
    textKey: "",
    color: "#FFFFFF",
    route: "./" as const,
  };

  const styles = createStyles(
    theme,
    moduleConfig.color,
    horizontalScale,
    verticalScale
  );

  if (loading) {
    return null; // Or you could show a loading spinner here
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(moduleConfig.route)}
    >
      <View style={styles.itemContainer}>
        {moduleConfig.icon && (
          <moduleConfig.icon
            width={horizontalScale(24)}
            height={verticalScale(24)}
          />
        )}
        <Text style={styles.title}>{t(moduleConfig.textKey)}</Text>
        <ArrowDark />
      </View>
    </TouchableOpacity>
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
      backgroundColor: backgroundColor,
      borderRadius: 12,
      padding: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: horizontalScale(8),
    },
    title: {
      color: darkTheme.textColor,
      fontSize: verticalScale(16),
      fontFamily: "Semibold",
      marginLeft: 8,
    },
  });
