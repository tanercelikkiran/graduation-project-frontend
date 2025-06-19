import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

import KnowledgeIllustrationLight from "@/assets/illustrations/Knowledge Light.svg";
import KnowledgeIllustrationDark from "@/assets/illustrations/Knowledge Dark.svg";

import ButtonWithIcon from "@/components/ButtonWithIcon";
import ReturnButton from "@/components/ReturnButton";

const { width, height } = Dimensions.get("window");

export default function UserKnowledgeScreen() {
  // Ensure navigation bar stays hidden during knowledge selection
  useNavigationBar();

  const params = useLocalSearchParams();
  const selectedLanguage = params.language as string;

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { token, refreshToken } = useAuth();

  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Get the translated language name from the language code
  const translatedLanguage = t(`common.languageCodes.${selectedLanguage}`);

  const handleContinue = async (hasKnowledge: boolean) => {
    setError(null);

    if (!token) {
      console.error("Authentication required");
      setError(t("userKnowledge.authRequired"));
      return;
    }

    setIsUpdating(true);

    if (hasKnowledge) {
      router.navigate({
        pathname: "/user-level",
        params: {
          language: selectedLanguage,
        },
      });
      setIsUpdating(false);
      return;
    }

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
            level: "A1 - Beginner",
            learning_language: selectedLanguage, // Add the language to API call
          },
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("User level updated:", response.data);
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
              level: "A1 - Beginning",
              learning_language: selectedLanguage, // Add the language to API call
            },
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(
            "User level updated after token refresh:",
            retryResponse.data
          );
        } else {
          // Re-throw other errors
          throw apiError;
        }
      }

      router.navigate({
        pathname: "/user-purpose",
        params: {
          language: selectedLanguage,
        },
      });
    } catch (error) {
      console.error("Error updating user level:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setError(t("userKnowledge.sessionExpired"));
        } else {
          setError(
            error.response.data.detail || t("userKnowledge.updateError")
          );
        }
      } else {
        setError(
          error instanceof Error
            ? error.message
            : t("userKnowledge.generalError")
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <ReturnButton />

      {/* Header */}
      <Text style={styles.header}>
        {t("userKnowledge.question", { language: translatedLanguage })}
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Illustration */}
      {theme === "dark" ? (
        <KnowledgeIllustrationDark
          width={horizontalScale(400)}
          height={verticalScale(400)}
          style={{ alignSelf: "center" }}
        />
      ) : (
        <KnowledgeIllustrationLight
          width={horizontalScale(400)}
          height={verticalScale(400)}
          style={{ alignSelf: "center" }}
        />
      )}

      {/* Buttons */}
      {isUpdating ? (
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#FFFFFF" : "#000000"}
          style={styles.activityIndicator}
        />
      ) : (
        <View style={styles.buttonContainer}>
          <ButtonWithIcon
            title={t("userKnowledge.dontKnow", {
              language: translatedLanguage,
            })}
            icon="flag-outline"
            onPress={() => handleContinue(false)}
          />

          <ButtonWithIcon
            title={t("userKnowledge.knowSome", {
              language: translatedLanguage,
            })}
            icon="book-outline"
            onPress={() => handleContinue(true)}
          />
        </View>
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
      paddingHorizontal: horizontalScale(16),
      paddingTop: verticalScale(80),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    header: {
      fontSize: horizontalScale(20),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(20),
      fontFamily: "Medium",
      alignSelf: "center",
    },
    buttonContainer: {
      marginTop: verticalScale(20),
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      marginBottom: verticalScale(20),
      textAlign: "center",
      fontFamily: "Regular",
    },
    activityIndicator: {
      marginTop: verticalScale(30),
    },
  });
