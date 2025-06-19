// components/LevelSelectionBottomSheet.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@/components/BottomSheet";
import PrimaryButton from "@/components/PrimaryButton";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface LevelSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  levels: string[];
  selectedLevel: string | null;
  onLevelSelect: (level: string) => void;
  onConfirm: () => void;
}

const LevelSelectionBottomSheet: React.FC<LevelSelectionBottomSheetProps> = ({
  visible,
  onClose,
  levels,
  selectedLevel,
  onLevelSelect,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <BottomSheet visible={visible} title="Select your level" onClose={onClose}>
      {levels.map((level, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.levelOption,
            selectedLevel === level && {
              backgroundColor:
                theme === "dark"
                  ? darkTheme.surfaceBlueColor
                  : lightTheme.surfaceBlueColor,
            },
          ]}
          onPress={() => onLevelSelect(level)}
        >
          <Text
            style={[
              styles.levelText,
              selectedLevel === level && {
                color:
                  theme === "dark"
                    ? darkTheme.primaryColor
                    : lightTheme.primaryColor,
              },
            ]}
          >
            {level}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={24}
            color={
              selectedLevel === level
                ? lightTheme.primaryColor
                : theme === "dark"
                ? darkTheme.textColor
                : lightTheme.textColor
            }
          />
        </TouchableOpacity>
      ))}
      <View style={{ alignItems: "center" }}>
        <PrimaryButton
          title="Confirm"
          onPress={onConfirm}
          disabled={!selectedLevel}
        />
      </View>
    </BottomSheet>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    levelOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: verticalScale(15),
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(10),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    levelText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
  });

export default LevelSelectionBottomSheet;
