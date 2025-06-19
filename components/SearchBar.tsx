import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useScale } from "@/hooks/useScale";

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
}

export default function SearchBar({
  searchText,
  setSearchText,
  style,
  placeholder,
}: SearchBarProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <View style={[styles.searchContainer, style]}>
      <Ionicons
        name="search-outline"
        size={horizontalScale(20)}
        color={
          theme === "dark"
            ? darkTheme.secondaryTextColor
            : lightTheme.secondaryTextColor
        }
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder || t("common.search")}
        placeholderTextColor={
          theme === "dark"
            ? darkTheme.secondaryTextColor
            : lightTheme.secondaryTextColor
        }
        value={searchText}
        onChangeText={setSearchText}
      />
      {searchText.length > 0 && (
        <TouchableOpacity
          onPress={() => setSearchText("")}
          style={styles.clearButton}
        >
          <Ionicons
            name="close-circle"
            size={horizontalScale(20)}
            color={
              theme === "dark"
                ? darkTheme.secondaryTextColor
                : lightTheme.secondaryTextColor
            }
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(12),
      marginVertical: verticalScale(8),
      paddingHorizontal: horizontalScale(8),
      minHeight: verticalScale(48),
    },
    searchIcon: {
      marginRight: horizontalScale(8),
    },
    searchInput: {
      flex: 1,
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      paddingVertical: verticalScale(8),
    },
    clearButton: {
      padding: horizontalScale(4),
    },
  });
