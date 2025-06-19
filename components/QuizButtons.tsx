import React from "react";
import { View, StyleSheet } from "react-native";
import { t } from "i18next";

import ButtonWithIcon from "@/components/ButtonWithIcon";
import PrimaryButton from "@/components/PrimaryButton";
import { useScale } from "@/hooks/useScale";

interface QuizButtonsProps {
  isLastStep: boolean;
  handleGetRelevantWord: () => void;
  handleOpenOneLetter: () => void;
  handleGetEmoji: () => void;
  handleNext: () => void;
  isRelevantWordDisabled?: boolean;
  isEmojiDisabled?: boolean;
}

const QuizButtons: React.FC<QuizButtonsProps> = ({
  isLastStep,
  handleGetRelevantWord,
  handleOpenOneLetter,
  handleGetEmoji,
  handleNext,
  isRelevantWordDisabled = false,
  isEmojiDisabled = false,
}) => {
  const { horizontalScale, verticalScale } = useScale();
  return (
    <>
      <View style={styles.actionButtons}>
        <ButtonWithIcon
          title={t("modules.vocabulary.quiz.question.buttons.getRelevant")}
          icon="bulb-outline"
          width={horizontalScale(70)}
          fontSize={horizontalScale(12)}
          onPress={handleGetRelevantWord}
          disabled={isRelevantWordDisabled}
        />
        <ButtonWithIcon
          title={t("modules.vocabulary.quiz.question.buttons.openLetter")}
          icon="key-outline"
          width={horizontalScale(70)}
          fontSize={horizontalScale(12)}
          onPress={handleOpenOneLetter}
        />
        <ButtonWithIcon
          title={t("modules.vocabulary.quiz.question.buttons.getEmoji")}
          icon="happy-outline"
          width={horizontalScale(70)}
          fontSize={horizontalScale(12)}
          onPress={handleGetEmoji}
          disabled={isEmojiDisabled}
        />
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={isLastStep ? t("common.finish") : t("common.continue")}
          onPress={handleNext}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 20,
  },
});

export default QuizButtons;
