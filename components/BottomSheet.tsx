import React, { useState, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

// Get screen height for animation purposes
const screenHeight = Dimensions.get("window").height;

interface BottomSheetProps {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function BottomSheet({
  visible,
  title,
  children,
  onClose,
}: BottomSheetProps) {
  // Animation value for the slide effect
  const slideAnim = useState(new Animated.Value(screenHeight))[0];

  // Effect to handle visibility changes
  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to the top of the screen
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight, // Slide back down to the bottom
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const { theme } = useTheme();
  const styles = createStyles(
    theme,
    useScale().horizontalScale,
    useScale().verticalScale
  );
  const { horizontalScale, verticalScale } = useScale();

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons
          name="close"
          size={horizontalScale(24)}
          color={theme === "dark" ? darkTheme.textColor : lightTheme.textColor}
        />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.subHeader}>{title}</Text>

      {/* Children Content */}
      <View style={styles.contentContainer}>{children}</View>
    </Animated.View>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
      borderTopLeftRadius: horizontalScale(20),
      borderTopRightRadius: horizontalScale(20),
      padding: verticalScale(20),
      elevation: 5,
    },
    closeButton: {
      alignSelf: "flex-end",
      marginBottom: verticalScale(10),
    },
    subHeader: {
      fontSize: horizontalScale(18),
      fontFamily: "Medium",
      marginBottom: verticalScale(15),
      marginLeft: horizontalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    contentContainer: {
      marginTop: verticalScale(10),
    },
  });
