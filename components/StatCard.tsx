import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

import TimeIcon from "@/assets/icons/Time.svg";
import SuccessIcon from "@/assets/icons/Success.svg";
import TextIcon from "@/assets/icons/Text.svg";
import VocabularyIconDark from "@/assets/icons/Vocabulary Dark.svg";
import { darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

interface StatCardProps {
  whichIcon: string;
  backgroundColor: string;
  text: string;
  value: string | number;
}

export default function StatCard({
  whichIcon,
  backgroundColor,
  text,
  value,
}: StatCardProps) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(horizontalScale, verticalScale);

  return (
    <View style={[styles.card, { backgroundColor }]}>
      {whichIcon === "success" && <SuccessIcon width={horizontalScale(24)} height={verticalScale(24)} />}
      {whichIcon === "time" && <TimeIcon width={horizontalScale(24)} height={verticalScale(24)} />}
      {whichIcon === "text" && <TextIcon width={horizontalScale(24)} height={verticalScale(24)} />}
      {whichIcon === "vocab" && <VocabularyIconDark width={horizontalScale(24)} height={verticalScale(24)} />}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const createStyles = (
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    card: {
      flex: 1,
      alignItems: "center",
      padding: horizontalScale(10),
      borderRadius: horizontalScale(12),
      marginHorizontal: horizontalScale(8),
    },
    text: {
      fontSize: horizontalScale(10),
      fontFamily: "SemiBold",
      color: darkTheme.textColor,
      textAlign: "center",
    },
    value: {
      fontSize: horizontalScale(18),
      fontFamily: "Semibold",
      paddingVertical: verticalScale(5),
      color: darkTheme.textColor,
    },
  });
