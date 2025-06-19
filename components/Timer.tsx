import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface TimerProps {
  totalTime: number; // Total time in milliseconds
}

export default function Timer({ totalTime }: TimerProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | number | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1000) {
            if (interval) {
              clearInterval(interval);
            }
            setIsActive(false);
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft]);

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.timerContainer}>
      <Text
        style={[
          styles.timerText,
          {
            color:
              theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
          },
        ]}
      >
        {formatTime()}
      </Text>
    </View>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    timerContainer: {
      padding: horizontalScale(10),
      borderRadius: horizontalScale(8),
      alignItems: "center",
      justifyContent: "center",
    },
    timerText: {
      fontSize: verticalScale(24),
      fontFamily: "Semibold",
      textAlign: "center",
    },
  });
