import React from "react";
import { View, StyleSheet } from "react-native";
import { useProgress } from "@/contexts/ProgressContext";
import * as Progress from "react-native-progress";
import { useScale } from "@/hooks/useScale";

export default function ProgressBar() {
  const { progress } = useProgress();
  const { horizontalScale } = useScale();

  const styles = createStyles(horizontalScale, () => 0); // verticalScale is not used

  return (
    <View style={styles.container}>
      <Progress.Bar
        progress={progress / 100}
        width={horizontalScale(335)} // Scaled width that maintains proportions
        height={12}
        borderRadius={12}
        unfilledColor={"#f8f8f8"}
        borderWidth={0}
      />
    </View>
  );
}

const createStyles = (
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      width: "100%",
      paddingHorizontal: horizontalScale(16),
    },
    progressBar: {},
  });
