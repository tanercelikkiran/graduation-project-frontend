import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  extraStyles?: {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  extraStyles,
}: PrimaryButtonProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, disabled, horizontalScale, verticalScale);

  // Button should be disabled when loading
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, extraStyles?.container]}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
    >
      <View style={styles.contentContainer}>
        <Text style={[styles.buttonText, extraStyles?.text]}>{title}</Text>
        {loading && (
          <ActivityIndicator
            size="small"
            color={
              theme === "dark"
                ? darkTheme.primaryButtonTextColor
                : lightTheme.primaryButtonTextColor
            }
            style={styles.loader}
          />
        )}
      </View>
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
      minWidth: horizontalScale(45),
      paddingHorizontal: horizontalScale(20),
      marginVertical: verticalScale(10),
      backgroundColor:
        theme === "dark"
          ? disabled
            ? darkTheme.primaryDisabledButtonColor
            : darkTheme.primaryButtonColor
          : disabled
          ? lightTheme.primaryDisabledButtonColor
          : lightTheme.primaryButtonColor,
      borderRadius: horizontalScale(12),
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      minHeight: horizontalScale(45),
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color:
        theme === "dark"
          ? disabled
            ? darkTheme.primaryDisabledButtonTextColor
            : darkTheme.primaryButtonTextColor
          : disabled
          ? lightTheme.primaryDisabledButtonTextColor
          : lightTheme.primaryButtonTextColor,
      fontFamily: "Bold",
      fontSize: horizontalScale(16),
      alignSelf: "center",
      textAlign: "center",
    },
    loader: {
      marginLeft: horizontalScale(10),
    },
  });
