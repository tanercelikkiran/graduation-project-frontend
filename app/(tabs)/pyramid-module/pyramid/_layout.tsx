import React, { useEffect, useCallback } from "react";
import { View, StyleSheet, BackHandler, Alert } from "react-native";
import { router, Stack, useSegments, useFocusEffect } from "expo-router";
import { ProgressProvider, useProgress } from "@/contexts/ProgressContext";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import ProgressBar from "@/components/ProgressBar";
import CloseButton from "@/components/CloseButton";
import { usePyramid } from "@/hooks/usePyramid";
import { useTranslation } from "react-i18next";

// Header komponent'i
function Header() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <NavigationButton />
      <ProgressBar />
    </View>
  );
}

// Navigasyon butonu komponenti
function NavigationButton() {
  const { resetProgress } = useProgress();
  const { resetPyramid } = usePyramid();
  const { t } = useTranslation();

  const handleQuit = useCallback(() => {
    Alert.alert(
      t("modules.pyramid.quit.title"),
      t("modules.pyramid.quit.message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("modules.pyramid.quit.confirm"),
          style: "destructive",
          onPress: () => {
            resetPyramid(); // This already calls resetProgress internally
            router.replace("../(tabs)"); // Use replace to clear the stack
          },
        },
      ]
    );
  }, [resetPyramid, t]);

  return <CloseButton onPress={handleQuit} />;
}

// Hardware back button handler
function BackButtonHandler() {
  const { resetPyramid } = usePyramid();
  const { t } = useTranslation();
  const segments = useSegments();
  const isInPyramidSession = segments.length >= 4 && 
    ["expand", "shrink", "replace", "paraphrase"].includes(segments[3]);

  useFocusEffect(
    useCallback(() => {
      if (!isInPyramidSession) return;

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          Alert.alert(
            t("modules.pyramid.quit.title"),
            t("modules.pyramid.quit.message"),
            [
              {
                text: t("common.cancel"),
                style: "cancel",
              },
              {
                text: t("modules.pyramid.quit.confirm"),
                style: "destructive",
                onPress: () => {
                  resetPyramid();
                  router.replace("../(tabs)");
                },
              },
            ]
          );
          return true; // Prevent default back behavior
        }
      );

      return () => backHandler.remove();
    }, [isInPyramidSession, resetPyramid, t])
  );

  return null;
}

export default function RootLayout() {
  const segments = useSegments();
  const isIndexPage = segments.length === 3 && segments[2] === "pyramid";
  const isResultPage = segments.length === 4 && segments[3] === "result";
  const { theme } = useTheme();

  return (
    <ProgressProvider>
      <BackButtonHandler />
      {!isIndexPage && !isResultPage && <Header />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="expand" />
        <Stack.Screen name="replace" />
        <Stack.Screen name="shrink" />
        <Stack.Screen name="paraphrase" />
        <Stack.Screen name="result" />
      </Stack>
    </ProgressProvider>
  );
}

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 5,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
      zIndex: -1,
    },
  });
