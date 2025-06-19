import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useScale } from "@/hooks/useScale";

interface Language {
  code: string;
  name: string;
  displayName?: string;
  nativeName?: string; // Native language name (e.g., "Español", "Français", "Türkçe")
}

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  languages: Language[];
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageSelectionModal = ({
  visible,
  onClose,
  languages,
  selectedLanguage,
  onSelectLanguage,
}: LanguageSelectionModalProps) => {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handleLanguageSelect = (languageCode: string) => {
    onSelectLanguage(languageCode);
    onClose();
  };

  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("languageSelection.chooseLanguage")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={horizontalScale(24)}
                color={
                  theme === "dark" ? darkTheme.textColor : lightTheme.textColor
                }
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={languages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  selectedLanguage === item.displayName &&
                    styles.selectedLanguageItem,
                ]}
                onPress={() =>
                  handleLanguageSelect(item.displayName || item.name)
                }
              >
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === item.displayName &&
                      styles.selectedLanguageName,
                  ]}
                >
                  {item.nativeName || item.displayName || item.name}
                </Text>
                {selectedLanguage === item.displayName && (
                  <Ionicons
                    name="checkmark"
                    size={horizontalScale(24)}
                    color={
                      theme === "dark"
                        ? darkTheme.primaryColor
                        : lightTheme.primaryColor
                    }
                  />
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 
        theme === "dark" 
          ? darkTheme.transparentBackgroundColor 
          : lightTheme.transparentBackgroundColor,
    },
    modalContainer: {
      width: "80%",
      maxHeight: "70%",
      backgroundColor:
        theme === "dark"
          ? darkTheme.cardBackgroundColor
          : lightTheme.cardBackgroundColor,
      borderRadius: horizontalScale(16),
      overflow: "hidden",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
    modalTitle: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    closeButton: {
      padding: horizontalScale(4),
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: verticalScale(16),
      paddingHorizontal: horizontalScale(16),
    },
    selectedLanguageItem: {
      backgroundColor:
        theme === "dark" ? "rgba(0, 122, 255, 0.1)" : "rgba(0, 122, 255, 0.05)",
    },
    languageName: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    selectedLanguageName: {
      color:
        theme === "dark" ? darkTheme.primaryColor : lightTheme.primaryColor,
      fontFamily: "Bold",
    },
    separator: {
      height: 1,
      backgroundColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      marginHorizontal: horizontalScale(16),
    },
  });

export default LanguageSelectionModal;
