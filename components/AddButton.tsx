import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";

import AddIcon from "@/assets/icons/Plus.svg";
import { useScale } from "@/hooks/useScale";

interface CreateButtonProps {
  onPress: () => void;
}

export default function AddButton({ onPress }: CreateButtonProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <AddIcon width={horizontalScale(48)} height={verticalScale(48)} />
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) => {
  const size = horizontalScale(56);
  return StyleSheet.create({
    button: {
      position: "absolute",
      right: horizontalScale(20),
      bottom: verticalScale(20),
      width: size,
      height: size,
      padding: horizontalScale(5),
      borderRadius: size / 2,
      backgroundColor:
        theme === "dark" ? darkTheme.primaryColor : lightTheme.primaryColor,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
