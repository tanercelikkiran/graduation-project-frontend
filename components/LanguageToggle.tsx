import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useScale } from "@/hooks/useScale";
import { lightTheme, darkTheme } from "@/themes/Themes";
import axios from "axios";

import EnglishIcon from "@/assets/flags/England Sign.svg";
import SpanishIcon from "@/assets/flags/Spain Sign.svg";
import TurkishIcon from "@/assets/flags/Turkey Sign.svg";

import LanguageSelectionModal from "./LanguageSelectionModal";
import { SafeAreaView } from "react-native-safe-area-context";

const LanguageToggle: React.FC = () => {
  const { interfaceLanguage, setInterfaceLanguage, interfaceLanguageOptions } =
    useLanguage();
  const { token } = useAuth();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const [modalVisible, setModalVisible] = useState(false);

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const getCurrentFlag = () => {
    const currentLang = interfaceLanguageOptions.find(
      (lang) => lang.displayName === interfaceLanguage
    );

    switch (currentLang?.code) {
      case "en":
        return (
          <EnglishIcon width={horizontalScale(32)} height={verticalScale(32)} />
        );
      case "es":
        return (
          <SpanishIcon width={horizontalScale(32)} height={verticalScale(32)} />
        );
      case "tr":
        return (
          <TurkishIcon width={horizontalScale(32)} height={verticalScale(32)} />
        );
      default:
        return (
          <EnglishIcon width={horizontalScale(32)} height={verticalScale(32)} />
        );
    }
  };

  const handleLanguageSelect = async (language: string) => {
    setInterfaceLanguage(language);
    setModalVisible(false);
    
    // Update backend if user is logged in
    if (token) {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        await axios.put(
          `${apiUrl}/user/update`,
          {
            system_language: language,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error updating user language:", error);
      }
    }
  };

  return (
    <SafeAreaView>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
      >
        {getCurrentFlag()}
      </TouchableOpacity>

      <LanguageSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        languages={interfaceLanguageOptions}
        selectedLanguage={interfaceLanguage}
        onSelectLanguage={handleLanguageSelect}
      />
    </SafeAreaView>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      padding: horizontalScale(8),
    },
  });

export default LanguageToggle;
