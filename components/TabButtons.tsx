import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface TabButtonsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

const TabButtons: React.FC<TabButtonsProps> = ({
  activeTab,
  setActiveTab,
  tabs,
}) => {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <View style={styles.buttonRow}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.selectedTabButton,
          ]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.id && styles.selectedTabButtonText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: horizontalScale(16),
      marginBottom: verticalScale(16),
    },
    tabButton: {
      flex: 1,
      paddingVertical: verticalScale(12),
      alignItems: "center",
      backgroundColor: "transparent",
      borderRadius: horizontalScale(12),
      marginHorizontal: horizontalScale(4),
    },
    selectedTabButton: {
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlueColor
          : lightTheme.surfaceBlueColor,
    },
    tabButtonText: {
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Medium",
    },
    selectedTabButtonText: {
      color: "#007AFF",
    },
  });

export default TabButtons;
