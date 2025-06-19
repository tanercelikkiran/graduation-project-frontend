import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { lightTheme, darkTheme } from "@/themes/Themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useScale } from "@/hooks/useScale";

import Logo from "@/assets/icons/Logo.svg";
import AppNameLight from "@/assets/images/App Name Light.svg";
import AppNameDark from "@/assets/images/App Name Dark.svg";

import OrSeparator from "@/components/OrSeparator";
import PrimaryButton from "@/components/PrimaryButton";
import TextButton from "@/components/TextButton";
import ButtonWithIcon from "@/components/ButtonWithIcon";
import LanguageToggle from "@/components/LanguageToggle";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function LoginPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Ensure navigation bar stays hidden during registration
  useNavigationBar();

  const [email, setEmail] = React.useState<string>("");
  const [emailError, setEmailError] = React.useState<string>("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (email.trim() === "") {
      setEmailError(t("auth.emailRequired"));
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError(t("auth.emailError"));
      return;
    }
    router.navigate({
      pathname: "/create-username",
      params: { email: email },
    });
  };

  const handleGoogleSignup = async () => {};

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
      <Text style={styles.subHeader}>{t("auth.signupContinue")}</Text>

      <View style={styles.emailContainer}>
        <Text style={styles.emailText}>{t("auth.email")}</Text>
        <TextInput
          style={styles.input}
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
      {/* Continue Button */}
      <PrimaryButton title={t("common.continue")} onPress={handleSignup} />
      {/* Divider */}
      <OrSeparator />

      <ButtonWithIcon
        title={t("auth.continueWithGoogle")}
        icon="logo-google"
        onPress={() => {
          handleGoogleSignup();
        }}
      />

      {/* Terms and Conditions */}
      <Text style={styles.terms}>{t("auth.terms")}</Text>

      {/* Sign Up Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginLinkText}>
          {t("auth.alreadyHaveAccount")}{" "}
        </Text>
        <TextButton
          title={t("auth.login")}
          onPress={() => router.navigate("/login")}
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
      flexDirection: "column",
      width: horizontalScale(300),
    },
    emailText: {
      fontFamily: "Regular",
      textAlign: "left",
      fontSize: horizontalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      paddingLeft: horizontalScale(5),
    },
    input: {
      fontFamily: "Regular",
      height: verticalScale(45),
      borderRadius: 12,
      paddingHorizontal: horizontalScale(10),
      marginVertical: verticalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      borderColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      borderWidth: 1,
    },
    errorText: {
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      fontFamily: "Regular",
      fontSize: horizontalScale(10),
      marginLeft: horizontalScale(5),
    },
    subHeader: {
      fontFamily: "Medium",
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(20),
      alignSelf: "center",
      textAlign: "center",
    },
    terms: {
      fontFamily: "Regular",
      fontSize: horizontalScale(12),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
      marginVertical: verticalScale(20),
      width: horizontalScale(300),
    },
    loginLinkText: {
      fontFamily: "Regular",
      fontSize: horizontalScale(14),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: verticalScale(20),
    },
  });
