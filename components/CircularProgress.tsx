import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

type CircularProgressProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  total: number;
  color: string;
};

const CircularProgress = ({
  size,
  strokeWidth,
  progress,
  total,
  color,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = (progress / total) * 100;
  const strokeDashoffset =
    circumference - (circumference * progressValue) / 100;

  return (
    <View style={styles.container}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          opacity={0.2}
          fill="transparent"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
        {/* Progress Text */}
        <SvgText
          x={size / 2}
          y={size / 2 + 5}
          fontSize="10"
          fontFamily="Medium"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          {progress}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default CircularProgress;
