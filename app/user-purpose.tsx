import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useScale } from "@/hooks/useScale";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import ButtonWithIcon from "@/components/ButtonWithIcon";
import OrSeparator from "@/components/OrSeparator";
import PrimaryButton from "@/components/PrimaryButton";
import ReturnButton from "@/components/ReturnButton";
import { useNavigationBar } from "@/hooks/useNavigationBar";

const { width, height } = Dimensions.get("window");

export default function UserPurposeScreen() {
  // Ensure navigation bar stays hidden during user purpose selection
  useNavigationBar();

  const { token } = useAuth();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const selectedLanguage = params.language as string;
  const [userPurpose, setUserPurpose] = useState<string>("");
  const [customPurpose, setCustomPurpose] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get the translated language name from the language code
  const translatedLanguage = t(`common.languageCodes.${selectedLanguage}`);

  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handleSelectPurpose = (purpose: string) => {
    setUserPurpose(purpose);
    setCustomPurpose("");
  };

  const handleCustomPurposeChange = (text: string) => {
    setCustomPurpose(text);
    if (text.trim()) {
      setUserPurpose("Custom");
    } else {
      setUserPurpose("");
    }
  };

  const handleContinue = async () => {
    if (!userPurpose && !customPurpose) return;

    setIsLoading(true);
    setError(null);

    try {
      const purposeToSend =
        userPurpose === "Custom" ? customPurpose : userPurpose;
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      if (!token) {
        throw new Error(t("userPurpose.errors.authRequired"));
      }

      const response = await axios.put(
        `${apiUrl}/user/update`,
        { purpose: purposeToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("User purpose updated:", response.data);
      router.navigate({ pathname: "/start" });
    } catch (error) {
      console.error("Error updating user purpose:", error);
      setError(t("userPurpose.errors.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <ReturnButton />

      {/* Header */}
      <Text style={styles.header}>
        {t("userPurpose.title", { language: translatedLanguage })}
      </Text>

      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <ButtonWithIcon
          title={t("userPurpose.purposes.generalKnowledge")}
          icon="aperture-outline"
          onPress={() =>
            handleSelectPurpose(t("userPurpose.purposes.generalKnowledge"))
          }
          selected={userPurpose === t("userPurpose.purposes.generalKnowledge")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.science")}
          icon="flask-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.science"))}
          selected={userPurpose === t("userPurpose.purposes.science")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.arts")}
          icon="color-palette-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.arts"))}
          selected={userPurpose === t("userPurpose.purposes.arts")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.history")}
          icon="book-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.history"))}
          selected={userPurpose === t("userPurpose.purposes.history")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.cooking")}
          icon="restaurant-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.cooking"))}
          selected={userPurpose === t("userPurpose.purposes.cooking")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.business")}
          icon="briefcase-outline"
          onPress={() =>
            handleSelectPurpose(t("userPurpose.purposes.business"))
          }
          selected={userPurpose === t("userPurpose.purposes.business")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.news")}
          icon="newspaper-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.news"))}
          selected={userPurpose === t("userPurpose.purposes.news")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.health")}
          icon="medical-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.health"))}
          selected={userPurpose === t("userPurpose.purposes.health")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.travel")}
          icon="airplane-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.travel"))}
          selected={userPurpose === t("userPurpose.purposes.travel")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.music")}
          icon="musical-notes-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.music"))}
          selected={userPurpose === t("userPurpose.purposes.music")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.sports")}
          icon="football-outline"
          onPress={() => handleSelectPurpose(t("userPurpose.purposes.sports"))}
          selected={userPurpose === t("userPurpose.purposes.sports")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.technology")}
          icon="hardware-chip-outline"
          onPress={() =>
            handleSelectPurpose(t("userPurpose.purposes.technology"))
          }
          selected={userPurpose === t("userPurpose.purposes.technology")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.philosophy")}
          icon="prism-outline"
          onPress={() =>
            handleSelectPurpose(t("userPurpose.purposes.philosophy"))
          }
          selected={userPurpose === t("userPurpose.purposes.philosophy")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.environment")}
          icon="leaf-outline"
          onPress={() =>
            handleSelectPurpose(t("userPurpose.purposes.environment"))
          }
          selected={userPurpose === t("userPurpose.purposes.environment")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.literature")}
          icon="library-outline"
          onPress={() =>
            handleSelectPurpose(t("userPurpose.purposes.literature"))
          }
          selected={userPurpose === t("userPurpose.purposes.literature")}
        />

        <ButtonWithIcon
          title={t("userPurpose.purposes.socialMedia")}
          icon="chatbubbles-outline"
          onPress={() =>
            handleSelectPurpose(t("userPurpose.purposes.socialMedia"))
          }
          selected={userPurpose === t("userPurpose.purposes.socialMedia")}
        />
      </ScrollView>

      <OrSeparator />

      <Text style={styles.subHeader}>{t("userPurpose.customTitle")}</Text>

      <View>
        <TextInput
          style={[
            styles.descriptionInput,
            userPurpose === "Custom" && styles.highlightedInput,
          ]}
          placeholder={t("userPurpose.customPlaceholder")}
          placeholderTextColor={
            theme === "dark"
              ? darkTheme.bodySecondaryColor
              : lightTheme.bodySecondaryColor
          }
          multiline
          numberOfLines={7}
          value={customPurpose}
          onChangeText={handleCustomPurposeChange}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.infoText}>{t("userPurpose.info")}</Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={
            theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor
          }
          style={{ marginTop: horizontalScale(20) }}
        />
      ) : (
        <PrimaryButton
          title={t("userPurpose.confirm")}
          onPress={handleContinue}
          disabled={!userPurpose}
        />
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
      paddingTop: verticalScale(height * 0.075),
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
    subHeader: {
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(10),
      fontFamily: "Medium",
    },
    descriptionInput: {
      width: horizontalScale(300),
      height: verticalScale(100),
      padding: horizontalScale(10),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Regular",
      fontSize: horizontalScale(14),
      borderRadius: horizontalScale(12),
      textAlignVertical: "top",
      textAlign: "left",
    },
    highlightedInput: {
      borderWidth: 2,
      borderColor:
        theme === "dark" ? darkTheme.accentColor : lightTheme.accentColor,
    },
    infoText: {
      fontSize: horizontalScale(14),
      width: horizontalScale(300),
      color:
        theme === "dark"
          ? darkTheme.bodySecondaryColor
          : lightTheme.bodySecondaryColor,
      fontFamily: "Regular",
      marginTop: verticalScale(10),
      textAlign: "left",
    },
    errorText: {
      fontSize: horizontalScale(14),
      color: theme === "dark" ? darkTheme.errorColor : lightTheme.errorColor,
      fontFamily: "Regular",
      textAlign: "center",
    },
    scrollViewContainer: {
      width: "100%",
      maxHeight: verticalScale(250),
    },
    scrollViewContent: {
      alignItems: "center",
    },
  });
