import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useScale } from "@/hooks/useScale";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/PrimaryButton";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";

import NoConnectionIllustrationDark from "@/assets/illustrations/No Connection Dark.svg";
import NoConnectionIllustrationLight from "@/assets/illustrations/No Connection Light.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function OfflinePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Ensure navigation bar stays hidden on offline page
  useNavigationBar();

  const handleRetry = async () => {
    try {
      const response = await fetch("https://www.google.com");
      if (response.ok) {
        router.replace("/splash");
      }
    } catch (error) {
      console.error("Bağlantı hatası:", error);
      router.replace("./offline");
    }
  };
  const { horizontalScale } = useScale();
  const maxIllustrationSize = 300;
  const calculatedIllustrationSize = horizontalScale(300);
  const illustrationSize = Math.min(
    calculatedIllustrationSize,
    maxIllustrationSize
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {theme === "dark" ? (
          <NoConnectionIllustrationDark
            width={illustrationSize}
            height={illustrationSize}
          />
        ) : (
          <NoConnectionIllustrationLight
            width={illustrationSize}
            height={illustrationSize}
          />
        )}
        <Text style={styles.title}>{t("offline.title")}</Text>
        <Text style={styles.description}>{t("offline.description")}</Text>
        <PrimaryButton title={t("offline.retryButton")} onPress={handleRetry} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: string) => {
  const { horizontalScale, verticalScale } = useScale();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalScale(20),
      paddingVertical: verticalScale(20),
    },
    content: {
      width: "100%",
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
    },
    title: {
      fontSize: horizontalScale(24),
      fontFamily: "Bold",
      marginBottom: verticalScale(16),
      textAlign: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    description: {
      fontSize: horizontalScale(16),
      textAlign: "center",
      fontFamily: "Regular",
      marginBottom: verticalScale(32),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
  });
};
