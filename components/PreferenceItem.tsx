import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Pressable,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { Ionicons } from "@expo/vector-icons";
import { useScale } from "@/hooks/useScale";

interface PreferenceItemProps {
  title: string;
  value?: boolean;
  onValueChange?: () => void;
  showSwitch?: boolean;
  showChevron?: boolean;
  rightText?: string;
  onPress?: () => void;
}

// Interface for the AnimatedSwitch component
interface AnimatedSwitchProps {
  value: boolean;
  onValueChange: () => void;
  theme: string;
}

// Custom animated switch component
const AnimatedSwitch = ({
  value,
  onValueChange,
  theme,
}: AnimatedSwitchProps) => {
  // Animation values
  const switchAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  const { horizontalScale, verticalScale } = useScale();

  // Switch measurements
  const SWITCH_WIDTH = horizontalScale(40);
  const SWITCH_HEIGHT = horizontalScale(24);
  const THUMB_SIZE = horizontalScale(18);
  const THUMB_PADDING = horizontalScale(2);

  // Track colors based on theme
  const TRACK_COLOR_OFF = theme === "dark" ? "#4d4d4d" : "#e9e9ea";
  const TRACK_COLOR_ON = "#007AFF";
  const THUMB_COLOR = "#FFFFFF";

  useEffect(() => {
    // Animate when value changes
    Animated.spring(switchAnimation, {
      toValue: value ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [value, switchAnimation]);

  // Interpolated values for animations
  const thumbTranslateX = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_PADDING, SWITCH_WIDTH - THUMB_SIZE - THUMB_PADDING],
  });

  const trackBackgroundColor = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_COLOR_OFF, TRACK_COLOR_ON],
  });

  return (
    <Pressable onPress={onValueChange}>
      <Animated.View
        style={[
          styles.switchTrack,
          {
            width: SWITCH_WIDTH,
            height: SWITCH_HEIGHT,
            borderRadius: SWITCH_HEIGHT / 2,
            backgroundColor: trackBackgroundColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: THUMB_COLOR,
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

export default function PreferenceItem({
  title,
  value = false,
  onValueChange,
  showSwitch = false,
  showChevron = false,
  rightText,
  onPress,
}: PreferenceItemProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      {showSwitch && (
        <AnimatedSwitch
          value={value}
          onValueChange={onValueChange || (() => {})}
          theme={theme}
        />
      )}
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={horizontalScale(20)}
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  switchTrack: {
    justifyContent: "center",
  },
  switchThumb: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: verticalScale(15),
      paddingHorizontal: horizontalScale(16),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(8),
    },
    title: {
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    rightText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      marginRight: horizontalScale(8),
    },
  });
