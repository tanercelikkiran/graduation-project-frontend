import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
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

type PyramidSentenceWithTTSProps = {
  sentence: string;
  meaning?: string;
  autoSpeech?: boolean;
  onSpeechStart?: () => void;
  onSpeechDone?: () => void;
  textStyle?: any;
  meaningStyle?: any;
  containerStyle?: any;
  showMeaning?: boolean;
  children?: React.ReactNode;
};

export default function PyramidSentenceWithTTS({
  sentence,
  meaning,
  autoSpeech = false,
  onSpeechStart,
  onSpeechDone,
  textStyle,
  meaningStyle,
  containerStyle,
  showMeaning = true,
  children,
}: PyramidSentenceWithTTSProps) {
  const { theme } = useTheme();
  const { learningLanguage } = useLearningLanguage();
  const { horizontalScale, verticalScale } = useScale();
  const isSpeakingRef = useRef(false);

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Get the appropriate language code for speech based on user's learning language
  const speechLanguageCode = learningLanguage
    ? languageCodeMap[learningLanguage]
    : null;

  // Function to speak the sentence using text-to-speech
  const speakSentence = async () => {
    // Check if we have a valid language code
    if (!speechLanguageCode || !sentence) {
      return;
    }

    // Stop any currently playing speech
    await Speech.stop();
    
    isSpeakingRef.current = true;
    onSpeechStart?.();

    try {
      await Speech.speak(sentence, {
        language: speechLanguageCode,
        pitch: 1.0,
        rate: 1.2,
        onDone: () => {
          isSpeakingRef.current = false;
          onSpeechDone?.();
        },
        onStopped: () => {
          isSpeakingRef.current = false;
          onSpeechDone?.();
        },
        onError: () => {
          isSpeakingRef.current = false;
          onSpeechDone?.();
        },
      });
    } catch (error) {
      console.error("Speech error:", error);
      isSpeakingRef.current = false;
      onSpeechDone?.();
    }
  };

  // Function to stop current speech
  const stopSpeech = async () => {
    if (isSpeakingRef.current) {
      await Speech.stop();
      isSpeakingRef.current = false;
      onSpeechDone?.();
    }
  };

  // Automatically speak the sentence when the component mounts if autoSpeech is true
  useEffect(() => {
    if (autoSpeech && sentence) {
      speakSentence();
    }

    // Cleanup function to stop speech when component unmounts
    return () => {
      stopSpeech();
    };
  }, [sentence, autoSpeech]);

  // Stop speech when sentence changes
  useEffect(() => {
    stopSpeech();
  }, [sentence]);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={speakSentence}
        disabled={!speechLanguageCode}
        style={styles.touchableContainer}
      >
        <View style={styles.sentenceContainer}>
          {children ? (
            children
          ) : (
            <Text
              style={[
                styles.sentence,
                !speechLanguageCode && styles.disabledSentence,
                textStyle,
              ]}
            >
              {sentence}
            </Text>
          )}
          {showMeaning && meaning && (
            <Text style={[styles.meaning, meaningStyle]}>{meaning}</Text>
          )}
        </View>
      </TouchableOpacity>
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
      alignItems: "center",
    },
    touchableContainer: {
      width: "100%",
    },
    sentenceContainer: {
      alignItems: "center",
    },
    sentence: {
      fontSize: horizontalScale(22),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
      fontFamily: "Bold",
    },
    disabledSentence: {
      opacity: 0.9,
    },
    meaning: {
      fontSize: horizontalScale(14),
      color:
        theme === "dark"
          ? darkTheme.secondaryTextColor
          : lightTheme.secondaryTextColor,
      textAlign: "center",
      fontFamily: "Regular",
      marginTop: verticalScale(8),
    },
  });
}

// Export the stop speech function for external use
export const stopCurrentSpeech = async () => {
  await Speech.stop();
};