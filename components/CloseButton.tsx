import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { SafeAreaView } from "react-native-safe-area-context";

type CloseButtonProps = {
  onPress: () => void;
};

export default function CloseButton({ onPress }: CloseButtonProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={styles.backButton}>
      <TouchableOpacity onPress={onPress}>
        <Ionicons
          name="close"
          size={32}
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
    marginVertical: 10,
    marginHorizontal: 5,
  },
});
