import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    button: {
      width: "100%",
      paddingVertical: verticalScale(10),
      paddingHorizontal: horizontalScale(20),
      marginVertical: verticalScale(10),
      backgroundColor:
        theme === "dark"
          ? darkTheme.tertiaryButtonColor
          : lightTheme.tertiaryButtonColor,
      borderRadius: horizontalScale(12),
      alignItems: "center",
    },
    buttonText: {
      color:
        theme === "dark"
          ? darkTheme.tertiaryButtonTextColor
          : lightTheme.tertiaryButtonTextColor,
      fontFamily: "Bold",
      fontSize: horizontalScale(18),
    },
  });
