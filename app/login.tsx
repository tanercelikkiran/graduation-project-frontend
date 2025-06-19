import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/contexts/AuthenticationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import { syncUserLanguageWithFrontend } from "@/utils/languageSync";

import { lightTheme, darkTheme } from "@/themes/Themes";
import { useTheme } from "@/contexts/ThemeContext";

import Logo from "@/assets/icons/Logo.svg";
import AppNameLight from "@/assets/images/App Name Light.svg";
import AppNameDark from "@/assets/images/App Name Dark.svg";

import ShowPasswordIconLight from "@/assets/icons/Show Password Light.svg";
import HidePasswordIconLight from "@/assets/icons/Hide Password Light.svg";
import ShowPasswordIconDark from "@/assets/icons/Show Password Dark.svg";
import HidePasswordIconDark from "@/assets/icons/Hide Password Dark.svg";

import OrSeparator from "@/components/OrSeparator";
import PrimaryButton from "@/components/PrimaryButton";
import TextButton from "@/components/TextButton";
import ButtonWithIcon from "@/components/ButtonWithIcon";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
  // Ensure navigation bar stays hidden during authentication
  useNavigationBar();

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const { login, token } = useAuth();
  const { setInterfaceLanguage } = useLanguage();

  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleContinue = async () => {
    try {
      const loginData = await login(email, password);
      
      // Sync user's system language with frontend after successful login
      if (loginData && loginData.access_token) {
        await syncUserLanguageWithFrontend(loginData.access_token, setInterfaceLanguage);
      } else if (token) {
        // Fallback to current token if loginData doesn't have access_token
        await syncUserLanguageWithFrontend(token, setInterfaceLanguage);
      }

      router.navigate({
        pathname: "/home",
      });
    } catch (error) {
      console.error("Login error:", error);
      // Handle login error (you might want to show an error message to user)
    }
  };

  const handleGoogleLogin = async () => {};

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Toggle */}
      <View style={styles.languageToggleContainer}>
        <LanguageToggle />
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo width={horizontalScale(40)} height={verticalScale(40)} />
        {theme === "dark" ? (
          <AppNameDark
            width={horizontalScale(200)}
            height={verticalScale(40)}
          />
        ) : (
          <AppNameLight
            width={horizontalScale(200)}
            height={verticalScale(40)}
          />
        )}
      </View>
      {/* Header */}
      <Text style={styles.subHeader}>{t("auth.loginContinue")}</Text>

      <View style={styles.emailContainer}>
        <Text style={styles.emailText}>{t("auth.email")}</Text>
        <TextInput
          style={styles.password}
          placeholder={t("auth.enterEmail")}
          placeholderTextColor={
            theme === "dark" ? darkTheme.textColor : lightTheme.textColor
          }
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => setEmail(text)}
          onBlur={() => {
            if (email.trim() === "") {
              setEmailError(t("auth.emailRequired"));
            } else if (!isValidEmail(email)) {
              setEmailError(t("auth.emailError"));
            } else {
              setEmailError("");
            }
          }}
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      </View>

      <View style={styles.passwordContainer}>
        <Text style={styles.label}>{t("auth.password")}</Text>

        {/* Input Field */}
        <TextInput
          style={styles.password}
          placeholder={t("auth.enterPassword")}
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor={
            theme === "dark" ? darkTheme.textColor : lightTheme.textColor
          }
          value={password}
          onChangeText={(text) => setPassword(text)}
          onBlur={() => {
            if (password.trim() === "") {
              setPasswordError(t("auth.passwordRequired"));
            } else {
              setPasswordError(null);
            }
          }}
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
        {/* Validation Message */}
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
      </View>
      {/* Continue Button */}
      <PrimaryButton title={t("common.continue")} onPress={handleContinue} />
      {/* Divider */}
      <OrSeparator />

      <ButtonWithIcon
        title={t("auth.continueWithGoogle")}
        icon="logo-google"
        onPress={() => {
          handleGoogleLogin();
        }}
      />

      {/* Sign Up Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginLinkText}>{t("auth.dontHaveAccount")} </Text>
        <TextButton
          title={t("auth.signup")}
          onPress={() => router.navigate("/signup")}
        />
      </View>
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
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    languageToggleContainer: {
      position: "absolute",
      top: verticalScale(20),
      right: horizontalScale(20),
      zIndex: 3,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(40),
      zIndex: 2,
    },
    emailContainer: {
      flexDirection: "column", // Yatay hizalama
    },
    emailText: {
      fontFamily: "Regular",
      textAlign: "left",
      fontSize: horizontalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      paddingLeft: horizontalScale(5),
    },
    loginContainer: {
      marginTop: verticalScale(20),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      fontFamily: "Regular",
      fontSize: horizontalScale(10),
      marginLeft: horizontalScale(5),
      marginBlockEnd: verticalScale(10),
    },
    subHeader: {
      fontFamily: "Medium",
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(20),
      alignSelf: "center",
      textAlign: "center",
    },
    password: {
      fontFamily: "Regular",
      width: horizontalScale(300),
      height: verticalScale(45),
      borderRadius: horizontalScale(12),
      paddingHorizontal: horizontalScale(10),
      marginVertical: verticalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      borderColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      borderWidth: 1,
    },
    passwordContainer: {
      flexDirection: "column",
    },
    label: {
      fontFamily: "Regular",
      fontSize: horizontalScale(12),
      marginLeft: horizontalScale(5),
      alignSelf: "flex-start",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    eyeIcon: {
      position: "absolute",
      right: horizontalScale(10),
      top: verticalScale(40),
      padding: horizontalScale(5),
    },
    loginLinkText: {
      fontFamily: "Regular",
      fontSize: horizontalScale(14),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
  });
