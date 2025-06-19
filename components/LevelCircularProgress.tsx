import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Svg, { Circle } from "react-native-svg";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface LevelCircularProgressProps {
  solved: string | string[] | number;
  total: string | string[] | number;
  level?: string | string[] | number;
}

const LevelCircularProgress = ({
  solved,
  total,
}: LevelCircularProgressProps) => {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Parse parameters
  const numSolved =
    typeof solved === "number"
      ? solved
      : parseInt(solved?.toString() || "0", 10);
  const numTotal =
    typeof total === "number" ? total : parseInt(total?.toString() || "1", 10);

  // Calculate progress percentage
  const progress = numTotal > 0 ? (numSolved / numTotal) * 100 : 0;
  // Calculate stroke values for SVG
  const size = horizontalScale(120); // Increased size from 80 to 120
  const strokeWidth = horizontalScale(10); // Increased stroke width proportionally
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <View>
      <View style={{ ...styles.levelCircle, backgroundColor: "transparent" }}>
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="#6C0BBC"
            opacity={0.3}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="#6C0BBC"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        </Svg>
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any, horizontalScale: any, verticalScale: any) => {
  const themeColors = theme === "dark" ? darkTheme : lightTheme;

  return StyleSheet.create({
    levelCircle: {
      width: horizontalScale(120),
      height: horizontalScale(120),
      borderRadius: horizontalScale(60),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: verticalScale(10),
      position: "relative",
    },
    percentageText: {
      color: themeColors.textColor,
      fontSize: horizontalScale(26),
      fontFamily: "Semibold",
      position: "absolute",
    },
  });
};

export default LevelCircularProgress;
