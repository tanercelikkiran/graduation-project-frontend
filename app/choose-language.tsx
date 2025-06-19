import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useScale } from "@/hooks/useScale";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

import ButtonWithFlag from "@/components/ButtonWithFlag";
import ReturnButton from "@/components/ReturnButton";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function ChooseLanguageScreen() {
  // Ensure navigation bar stays hidden during language selection
  useNavigationBar();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { token, refreshToken } = useAuth();
  const { currentLanguage } = useLanguage();

  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handleContinue = async (language: string) => {
    setError(null);

    // Save the selected language to AsyncStorage immediately
    try {
      await AsyncStorage.setItem("learningLanguage", language);
    } catch (error) {
      console.error("Error saving learning language to AsyncStorage:", error);
    }

    setIsUpdating(true);
    try {
      let currentToken = token;
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      try {
        // First attempt with current token
        if (!currentToken) {
          console.error(
            "No token found in context. Attempting to refresh token."
          );
          const refreshResult = await refreshToken();
          if (!refreshResult) {
            throw new Error("Unable to authenticate. Please log in again.");
          }
          // After refreshToken, we need to get the updated token from context
          currentToken = token; // This should now be updated in the context
        }

        const response = await axios.put(
          `${apiUrl}/user/update`,
          {
            learning_language: language,
          },
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("User language updated:", response.data);

        router.navigate({
          pathname: "/user-knowledge",
          params: {
            language: language,
          },
        });
      } catch (apiError) {
        if (axios.isAxiosError(apiError) && apiError.response?.status === 401) {
          // Token is expired, try to refresh and retry
          console.log("Token expired, attempting to refresh...");
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            throw new Error(
              "Unable to refresh authentication. Please log in again."
            );
          }

          // Get the latest token after refresh
          currentToken = token; // This should now be the refreshed token

          // Retry the request with the new token
          const retryResponse = await axios.put(
            `${apiUrl}/user/update`,
            {
              learning_language: language,
            },
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(
            "User language updated after token refresh:",
            retryResponse.data
          );

          router.navigate({
            pathname: "/user-knowledge",
            params: {
              language: language,
            },
          });
        } else {
          // Re-throw other errors
          throw apiError;
        }
      }
    } catch (error) {
      console.error("Error updating user language:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setError(t("chooseLanguage.errors.sessionExpired"));
        } else {
          setError(
            error.response.data.detail ||
              t("chooseLanguage.errors.updateFailed")
          );
        }
      } else {
        setError(
          error instanceof Error
            ? error.message
            : t("chooseLanguage.errors.generalError")
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ReturnButton />

      {/* Header */}
      <Text style={styles.header}>{t("chooseLanguage.title")}</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isUpdating ? (
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        />
      ) : (
        <>
          {/* Don't show English as a learning option if system language is English */}
          {currentLanguage !== "en" && (
            <ButtonWithFlag
              title={t("chooseLanguage.languages.english")}
              flag="english"
              onPress={() => handleContinue("English")}
            />
          )}

          {/* Don't show Spanish as a learning option if system language is Spanish */}
          {currentLanguage !== "es" && (
            <ButtonWithFlag
              title={t("chooseLanguage.languages.spanish")}
              flag="spanish"
              onPress={() => handleContinue("Spanish")}
            />
          )}

          {/* Don't show Turkish as a learning option if system language is Turkish */}
          {currentLanguage !== "tr" && (
            <ButtonWithFlag
              title={t("chooseLanguage.languages.turkish")}
              flag="turkish"
              onPress={() => handleContinue("Turkish")}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
      paddingTop: verticalScale(50),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    header: {
      fontSize: horizontalScale(20),
      fontFamily: "Medium",
      marginBottom: verticalScale(20),
      alignSelf: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    errorText: {
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      marginBottom: verticalScale(20),
      textAlign: "center",
      fontFamily: "Regular",
    },
  });
