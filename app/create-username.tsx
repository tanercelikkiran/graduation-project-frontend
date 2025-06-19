import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useScale } from "@/hooks/useScale";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";

import PrimaryButton from "@/components/PrimaryButton";
import ReturnButton from "@/components/ReturnButton";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function CreateUsernameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const email = params.email;
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Ensure navigation bar stays hidden during username creation
  useNavigationBar();

  const handleContinue = () => {
    if (username.trim() === "") {
      setError(t("auth.createUsername.error"));
      return;
    }
    router.navigate({
      pathname: "./create-password",
      params: { email: email, username: username },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ReturnButton />

      <View style={styles.headerContainer}>
        <Text style={styles.header}>{t("auth.createUsername.title")}</Text>
      </View>

      {/* Input Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{t("auth.createUsername.label")}</Text>

        {/* Input Field */}
        <TextInput
          style={styles.input}
          placeholder={t("auth.createUsername.placeholder")}
          placeholderTextColor={
            theme === "dark" ? darkTheme.textColor : lightTheme.textColor
          }
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Description */}
      <Text style={styles.description}>
        {t("auth.createUsername.description")}
      </Text>

      {/* Continue Button */}
      <PrimaryButton title={t("common.continue")} onPress={handleContinue} />
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
    labelContainer: {
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
    errorText: {
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      fontFamily: "Regular",
      fontSize: verticalScale(10),
      marginLeft: horizontalScale(30),
      alignSelf: "flex-start",
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
