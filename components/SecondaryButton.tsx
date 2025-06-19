import { TouchableOpacity, StyleSheet, Text, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

type SecondaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

const { width, height } = Dimensions.get("window");

export default function SecondaryButton({ 
  title, 
  onPress, 
  disabled = false 
}: SecondaryButtonProps) {
  
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, disabled, horizontalScale, verticalScale);

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  disabled: boolean,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    button: {
      width: horizontalScale(300),
      height: verticalScale(45),
      marginVertical: verticalScale(10),
      backgroundColor:
        theme === "dark"
          ? disabled
            ? darkTheme.secondaryDisabledButtonColor || darkTheme.secondaryButtonColor
            : darkTheme.secondaryButtonColor
          : disabled
          ? lightTheme.secondaryDisabledButtonColor || lightTheme.secondaryButtonColor
          : lightTheme.secondaryButtonColor,
      borderRadius: horizontalScale(12),
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color:
        theme === "dark"
          ? disabled
            ? darkTheme.secondaryDisabledButtonTextColor || darkTheme.secondaryButtonTextColor
            : darkTheme.secondaryButtonTextColor
          : disabled
          ? lightTheme.secondaryDisabledButtonTextColor || lightTheme.secondaryButtonTextColor
          : lightTheme.secondaryButtonTextColor,
      fontFamily: "Bold",
      fontSize: horizontalScale(16),
    },
  });
