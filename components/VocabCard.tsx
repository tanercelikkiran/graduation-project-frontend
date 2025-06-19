import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

import EnglishFlag from "@/assets/flags/England Sign.svg";
import SpanishFlag from "@/assets/flags/Spain Sign.svg";
import TurkishFlag from "@/assets/flags/Turkey Sign.svg";

import BlackVocab from "@/assets/icons/Vocab Filled Blue.svg";
import WhiteVocab from "@/assets/icons/Vocab Filled White.svg";

import LessonProgressEmptyLight from "@/assets/icons/Lesson Progress Black Empty.svg";
import LessonProgressFirstLight from "@/assets/icons/Lesson Progress Black First.svg";
import LessonProgressSecondLight from "@/assets/icons/Lesson Progress Black Second.svg";
import LessonProgressEmptyDark from "@/assets/icons/Lesson Progress White Empty.svg";
import LessonProgressFirstDark from "@/assets/icons/Lesson Progress White First.svg";
import LessonProgressSecondDark from "@/assets/icons/Lesson Progress White Second.svg";

import ActionIconLight from "@/assets/icons/Short Arrow Black Down.svg";
import ActionIconDark from "@/assets/icons/Short Arrow White Down.svg";

interface LessonItemProps {
  whichLanguage: "english" | "spanish" | "turkish" | "vocab";
  isSelected: boolean;
  title: string;
  whichStatusIcon: "empty" | "first" | "second";
  onPress?: () => void;
}

export default function VocabCard({
  whichLanguage,
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
        {/* Language Flags */}
        {whichLanguage === "english" && (
          <EnglishFlag style={styles.iconPlain} />
        )}
        {whichLanguage === "spanish" && (
          <SpanishFlag style={styles.iconPlain} />
        )}
        {whichLanguage === "turkish" && (
          <TurkishFlag style={styles.iconPlain} />
        )}

        {/* Vocab Icon */}
        {whichLanguage === "vocab" && (
          isSelected ? (
            <WhiteVocab style={styles.iconPlain} />
          ) : (
            <BlackVocab style={styles.iconPlain} />
          )
        )}

        {/* Title */}
        <Text style={[styles.title, isSelected && { color: "white" }]}>{title}</Text>

        {/* Status Icons */}
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

          {/* Action Icon */}
          <TouchableOpacity onPress={toggleExpand}>
            {isSelected ? (
              <ActionIconDark style={styles.miniIcon} />
            ) : (
              <ActionIconLight style={styles.miniIcon} />
            )}
          </TouchableOpacity>
        </View>
      </Container>

      {/* Expandable Content */}
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
