import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getErrorMessage, logContentError } from "@/utils/errorHandling";
import { useScale } from "@/hooks/useScale";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import ShowPasswordIconLight from "@/assets/icons/Show Password Light.svg";
import HidePasswordIconLight from "@/assets/icons/Hide Password Light.svg";
import ShowPasswordIconDark from "@/assets/icons/Show Password Dark.svg";
import HidePasswordIconDark from "@/assets/icons/Hide Password Dark.svg";
import PrimaryButton from "@/components/PrimaryButton";
import ReturnButton from "@/components/ReturnButton";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function CreateUsernameScreen() {
  // Ensure navigation bar stays hidden during password creation
  useNavigationBar();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, setUserSession } = useAuth(); // Add setUserSession from AuthContext
  const params = useLocalSearchParams();
  const username = params.username;
  const email = params.email;
  const router = useRouter();

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handleContinue = async () => {
    let newErrors = [];

    if (password.trim() === "") {
      setError(t("auth.createPassword.error"));
      return;
    }

    if (password.length < 8)
      newErrors.push(t("auth.createPassword.requirements.length"));
    if (!/[A-Z]/.test(password))
      newErrors.push(t("auth.createPassword.requirements.uppercase"));
    if (!/[a-z]/.test(password))
      newErrors.push(t("auth.createPassword.requirements.lowercase"));
    if (!/\d/.test(password))
      newErrors.push(t("auth.createPassword.requirements.number"));
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.push(t("auth.createPassword.requirements.special"));
    }

    if (newErrors.length > 0) {
      setError(`Password must contain ${newErrors.join(", ")}.`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/user/register`, {
        username,
        email,
        password,
        learning_language: "",
        purpose: "",
        level: "",
      });

      // Check if registration returns tokens directly
      if (response.data && response.data.access_token) {
        // If registration returns tokens directly, store them
        // Check for user object in response
        let userId;
        if (response.data.user && response.data.user.id) {
          userId = response.data.user.id;
        } else {
          userId = response.data.user_id || response.data.id;
        }

        if (!userId) {
          console.error("No user ID found in response:", response.data);
          setError(
            "Registration successful but user ID not found. Please try logging in."
          );
          setIsSubmitting(false);
          return;
        }

        // Update the auth context with the new token and user info
        await setUserSession(
          response.data.access_token,
          response.data.refresh_token || ""
        );

        console.log("User session set with ID:", userId);

        // Navigate to the next screen
        router.navigate({
          pathname: "/choose-language",
          params: {
            username: username,
          },
        });
      } else {
        // If registration doesn't return tokens, call login function
        try {
          await login(email as string, password);

          router.navigate({
            pathname: "/choose-language",
            params: {
              username: username,
            },
          });
        } catch (loginError) {
          console.error("Login error after registration:", loginError);
          setError(
            "Registration successful but couldn't log in automatically. Please go to the login screen."
          );
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      logContentError(error, "user registration");
      
      // Use the enhanced error handling
      const errorMessage = getErrorMessage(error, t);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setError(null);
  }, [password]);

  return (
    <SafeAreaView style={styles.container}>
      <ReturnButton />

      <View style={styles.headerContainer}>
        <Text style={styles.header}>{t("auth.createPassword.title")}</Text>
      </View>

      <View style={styles.passwordContainer}>
        <Text style={styles.label}>{t("auth.createPassword.label")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.createPassword.placeholder")}
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor={
            theme === "dark" ? darkTheme.textColor : lightTheme.textColor
          }
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!isPasswordVisible)}
        >
          {isPasswordVisible ? (
            theme === "dark" ? (
              <HidePasswordIconDark
                width={horizontalScale(20)}
                height={verticalScale(20)}
              />
            ) : (
              <HidePasswordIconLight
                width={horizontalScale(20)}
                height={verticalScale(20)}
              />
            )
          ) : theme === "dark" ? (
            <ShowPasswordIconDark
              width={horizontalScale(20)}
              height={verticalScale(20)}
            />
          ) : (
            <ShowPasswordIconLight
              width={horizontalScale(20)}
              height={verticalScale(20)}
            />
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!error && (
        <Text style={styles.description}>
          {t("auth.createPassword.requirements.full")}
        </Text>
      )}

      <PrimaryButton
        title={
          isSubmitting ? t("auth.createPassword.loading") : t("common.continue")
        }
        disabled={isSubmitting || !!error}
        onPress={handleContinue}
      />
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
    headerContainer: {
      marginBottom: verticalScale(20),
    },
    header: {
      fontFamily: "Medium",
      fontSize: verticalScale(24),
      alignSelf: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    passwordContainer: {
      width: horizontalScale(300),
      marginBottom: verticalScale(20),
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontFamily: "Regular",
      fontSize: verticalScale(12),
      marginBottom: verticalScale(5),
      marginLeft: horizontalScale(5),
      alignSelf: "flex-start",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    input: {
      width: horizontalScale(300),
      height: verticalScale(45),
      borderWidth: 1,
      borderColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      borderRadius: horizontalScale(12),
      paddingHorizontal: horizontalScale(8),
      fontSize: verticalScale(13),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    eyeIcon: {
      position: "absolute",
      right: horizontalScale(10),
      top: verticalScale(35),
      padding: horizontalScale(5),
    },
    errorText: {
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      width: horizontalScale(300),
      fontFamily: "Regular",
      fontSize: verticalScale(13),
      margin: verticalScale(5),
      alignSelf: "flex-start",
      marginLeft: horizontalScale(25),
    },
    description: {
      fontSize: verticalScale(12),
      fontFamily: "Regular",
      color:
        theme === "dark"
          ? darkTheme.bodySecondaryColor
          : lightTheme.bodySecondaryColor,
      marginBottom: verticalScale(20),
      paddingHorizontal: horizontalScale(5),
      width: horizontalScale(300),
    },
  });
