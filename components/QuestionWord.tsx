// QuestionWord.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import RelevantWordPopup from "@/components/RelevantWordPopup";
import { useScale } from "@/hooks/useScale";

// Map of learning languages to language codes for text-to-speech
const languageCodeMap: Record<string, string> = {
  English: "en-US",
  Spanish: "es-ES",
  Turkish: "tr-TR",
};

// Custom hook to get the user's learning language
function useLearningLanguage() {
  const [learningLanguage, setLearningLanguage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoredLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("learningLanguage");
        if (storedLanguage) {
          setLearningLanguage(storedLanguage);
        }
      } catch (error) {
        console.error("Error reading language from AsyncStorage:", error);
      }
    };

    fetchStoredLanguage();
  }, []);

  return { learningLanguage };
}

type QuestionWordProps = {
  word: string; // Gösterilecek kelime
  visible: boolean; // Popup görünür mü?
  popupWord: string; // Popup içinde gösterilecek kelime
  popupEmoji?: string; // Emoji for the popup
  onClose: () => void; // Popup kapanma fonksiyonu
  autoSpeech?: boolean; // Whether to automatically speak the word on mount
};

export default function QuestionWord({
  word,
  visible,
  popupWord,
  popupEmoji,
  onClose,
  autoSpeech = false,
}: QuestionWordProps) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { learningLanguage } = useLearningLanguage();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Get the appropriate language code for speech based on user's learning language
  const speechLanguageCode = learningLanguage
    ? languageCodeMap[learningLanguage]
    : null;

  // Function to speak the word using text-to-speech
  const speakWord = () => {
    // Check if we have a valid language code
    if (!speechLanguageCode) {
      return; // Silently do nothing if no language is set
    }

    Speech.speak(word, {
      language: speechLanguageCode,
      pitch: 1.0,
      rate: 0.8,
    });
  };

  // Automatically speak the word when the component mounts if autoSpeech is true
  useEffect(() => {
    if (autoSpeech && word) {
      speakWord();
    }
  }, [word, autoSpeech]);

  return (
    <View style={styles.container}>
      <View style={styles.wordContainer}>
        {/* Main word display with text-to-speech on press */}
        <TouchableOpacity
          onPress={speakWord}
          disabled={!speechLanguageCode} // Disable touch if no language
        >
          <Text
            style={[styles.word, !speechLanguageCode && styles.disabledWord]}
          >
            {word}
          </Text>
        </TouchableOpacity>

        {/* Relevant word popup when visible is true */}
        <RelevantWordPopup
          visible={visible}
          word={popupWord}
          emoji={popupEmoji}
          onClose={onClose}
        />
      </View>
    </View>
  );
}

function createStyles(
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    wordContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    word: {
      fontSize: horizontalScale(25),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    disabledWord: {
      opacity: 0.9, // Slightly dimmed to indicate it's not interactive
    },
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
  });
}
