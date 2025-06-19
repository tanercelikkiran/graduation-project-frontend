import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome5";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

// Define question type
export interface Question {
  id: string;
  title: string;
  short_description: string;
  solved: boolean;
}

interface QuestionItemProps {
  question: Question;
  onPress: () => void;
}

const QuestionItem = ({ question, onPress }: QuestionItemProps) => {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  return (
    <TouchableOpacity style={styles.questionItem} onPress={onPress}>
      <View style={styles.questionContent}>
        <Text style={styles.questionTitle}>{question.title}</Text>
        <Text style={styles.questionDescription}>
          {question.short_description}
        </Text>
      </View>
      <View style={styles.questionStatus}>
        <Icon
          name={question.solved ? "check-circle" : "circle"}
          size={24}
          color={
            question.solved
              ? "#4CAF50"
              : theme === "dark"
              ? darkTheme.textColor
              : lightTheme.textColor
          }
        />
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) => {
  const themeColors = theme === "dark" ? darkTheme : lightTheme;

  return StyleSheet.create({
    questionItem: {
      flexDirection: "row",
      padding: horizontalScale(16),
      borderRadius: verticalScale(12),
      backgroundColor: themeColors.cardBackgroundColor,
      marginBottom: verticalScale(12),
      marginHorizontal: horizontalScale(16),
    },
    questionContent: {
      flex: 1,
    },
    questionTitle: {
      fontSize: horizontalScale(16),
      fontFamily: "Semibold",
      color: themeColors.textColor,
      marginBottom: verticalScale(4),
    },
    questionDescription: {
      fontSize: horizontalScale(14),
      fontFamily: "Regular",
      color: themeColors.secondaryTextColor,
      maxWidth: horizontalScale(250),
    },
    questionStatus: {
      justifyContent: "center",
      paddingLeft: horizontalScale(8),
    },
  });
};

export default QuestionItem;
