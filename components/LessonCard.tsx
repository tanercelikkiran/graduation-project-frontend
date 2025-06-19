import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

import PyramidsIconSelected from "@/assets/icons/Pyramid Filled White.svg";
import PyramidsIconPlain from "@/assets/icons/Pyramid Filled Lesson.svg";
import VocabIconSelected from "@/assets/icons/Vocab Filled White.svg";
import VocabIconPlain from "@/assets/icons/Vocab Filled Blue.svg";
import ReadingIconSelected from "@/assets/icons/Reading Filled White.svg";
import ReadingIconPlain from "@/assets/icons/Reading Filled Blue.svg";
import WritingIconSelected from "@/assets/icons/Writing Filled White.svg";
import WritingIconPlain from "@/assets/icons/Writing Filled Blue.svg";

import LessonProgressEmptyLight from "@/assets/icons/Lesson Progress Black Empty.svg";
import LessonProgressFirstLight from "@/assets/icons/Lesson Progress Black First.svg";
import LessonProgressSecondLight from "@/assets/icons/Lesson Progress Black Second.svg";
import LessonProgressEmptyDark from "@/assets/icons/Lesson Progress White Empty.svg";
import LessonProgressFirstDark from "@/assets/icons/Lesson Progress White First.svg";
import LessonProgressSecondDark from "@/assets/icons/Lesson Progress White Second.svg";

import AlertIcon from "@/assets/icons/Alert.svg";
import SuccessIcon from "@/assets/icons/Success.svg";

import ActionIconLight from "@/assets/icons/Short Arrow Black Down.svg";
import ActionIconDark from "@/assets/icons/Short Arrow White Down.svg";

interface LessonItemProps {
  whichIcon: "pyramid" | "vocab" | "reading" | "writing";
  isSelected: boolean;
  title: string;
  whichStatusIcon: "empty" | "first" | "second" | "alert" | "success";
  onPress?: () => void;
}

export default function LessonCard({
  whichIcon,
  isSelected,
  title,
  whichStatusIcon,
  onPress,
}: LessonItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], // Adjust height when expanded
  });

  const Container = isSelected
    ? ({ children }: { children: React.ReactNode }) => (
        <TouchableOpacity style={styles.itemContainerSelected} onPress={onPress}>
          {children}
        </TouchableOpacity>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
          {children}
        </TouchableOpacity>
      );

  return (
    <View>
      <Container>
        {whichIcon === "pyramid" &&
          (isSelected ? (
            <PyramidsIconSelected style={styles.iconSelected} />
          ) : (
            <PyramidsIconPlain style={styles.iconPlain} />
          ))}
        <Text style={[styles.title, isSelected && { color: "white" }]}>{title}</Text>
        <View style={styles.iconGroup}>
          {whichStatusIcon === "empty" &&
            (isSelected ? (
              <LessonProgressEmptyDark style={styles.miniIcon} />
            ) : (
              <LessonProgressEmptyLight style={styles.miniIcon} />
            ))}
          {whichStatusIcon === "first" &&
            (isSelected ? (
              <LessonProgressFirstDark style={styles.miniIcon} />
            ) : (
              <LessonProgressFirstLight style={styles.miniIcon} />
            ))}
          {whichStatusIcon === "second" &&
            (isSelected ? (
              <LessonProgressSecondDark style={styles.miniIcon} />
            ) : (
              <LessonProgressSecondLight style={styles.miniIcon} />
            ))}
          {whichStatusIcon === "alert" && <AlertIcon style={styles.miniIcon} />}
          {whichStatusIcon === "success" && <SuccessIcon style={styles.miniIcon} />}
          <TouchableOpacity onPress={toggleExpand}>
            {isSelected ? (
              <ActionIconDark style={styles.miniIcon} />
            ) : (
              <ActionIconLight style={styles.miniIcon} />
            )}
          </TouchableOpacity>
        </View>
      </Container>

      <Animated.View style={[styles.expandableView, { height: heightInterpolate }]}>
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={{ color: "black", fontSize: 16 }}>Expanded Content Goes Here</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  itemContainerSelected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  iconSelected: {
    width: 48,
    height: 48,
    resizeMode: "center",
  },
  iconPlain: {
    width: 48,
    height: 48,
    resizeMode: "center",
  },
  title: {
    flex: 1,
    marginLeft: 20,
    fontFamily: "Semibold",
    fontSize: 20,
    color: "#000",
  },
  iconGroup: {
    flexDirection: "column",
    alignItems: "center",
  },
  miniIcon: {
    fontSize: 16,
    marginVertical: 4,
  },
  expandableView: {
    overflow: "hidden",
    backgroundColor: "#f1f1f1",
    marginHorizontal: 16,
    borderRadius: 8,
  },
  expandedContent: {
    padding: 12,
  },
});
