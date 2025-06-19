import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Keyboard,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
interface AnswerInputProps {
  length: number;
  value: string;
  onChange: (text: string) => void;
  revealedLetterCount: number;
  correctWord: string;
  theme: string;
  onClear?: () => void;
  isWrongAnswer?: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  length,
  value,
  onChange,
  revealedLetterCount,
  correctWord,
  theme,
  onClear,
  isWrongAnswer = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { width, height } = useWindowDimensions();
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const { horizontalScale, verticalScale } = useScale();

  // Kullanıcının girebileceği maksimum karakter sayısını belirle
  const availableSlots = length - revealedLetterCount;

  // Handle keyboard hiding to ensure proper blur state
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsFocused(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Effect to trigger animation when isWrongAnswer changes to true
  useEffect(() => {
    if (isWrongAnswer) {
      // Blur input to remove focus when wrong answer is detected
      inputRef.current?.blur();
      Keyboard.dismiss();
      setIsFocused(false);

      // Reset the animation value
      shakeAnimation.setValue(0);

      // Create stronger shake animation sequence
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 15,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -15,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 15,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -15,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 5,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isWrongAnswer, shakeAnimation]);

  // Force focus to show keyboard when component gets initial focus
  const handleFocus = () => {
    setIsFocused(true);
    // On iOS, sometimes we need this to ensure keyboard appears
    if (Platform.OS === "ios") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handlePress = () => {
    // Force keyboard to show on first touch
    if (!isFocused) {
      inputRef.current?.focus();
    }
    setIsFocused(true);
  };

  const handleChangeText = (text: string) => {
    // Enhanced regex to handle all Turkish, Spanish, and English characters
    const filteredText = text
      .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇáéíóúüñÁÉÍÓÚÜÑ]/g, "")
      .toLocaleLowerCase();

    // Limit the text to the available slots
    const limitedText = filteredText.slice(0, availableSlots);

    onChange(limitedText);
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === "Backspace" && value.length === 0) {
      onClear?.();
    }
  };

  // Aktif kutuyu belirle
  const activeIndex = isFocused ? revealedLetterCount + value.length : -1;

  // Calculate box dimensions based on screen size and word length
  // Make boxes smaller by reducing the base value from 45 to 35
  const boxWidth = Math.min(
    horizontalScale(35),
    (width * 0.8) / Math.min(length, 10)
  );

  // Adjust box height to maintain proportions but smaller
  const boxHeight = boxWidth * 1.4; // Reduced from 1.55 to 1.4

  // Adjust font size based on box size
  const fontSize = boxWidth * 0.44;

  // Explicitly get theme objects based on current theme
  const themeObj = theme === "dark" ? darkTheme : lightTheme;

  // Create responsive styles
  const styles = createStyles(
    theme,
    themeObj,
    horizontalScale,
    verticalScale,
    boxWidth,
    boxHeight,
    fontSize
  );

  // Filter out spaces from correctWord to only create boxes for actual characters
  const createBoxes = () => {
    const result = [];
    let visibleIndex = 0; // Tracks the visible position (excluding spaces)
    let currentWordStart = 0; // Tracks where each word starts
    let inWord = false;

    for (let i = 0; i < correctWord.length; i++) {
      const char = correctWord[i];

      if (char === " ") {
        // This is a space - don't create a box, but add word spacing
        if (inWord) {
          inWord = false;
          currentWordStart = visibleIndex;
        }
      } else {
        // This is a letter - create a box
        const isRevealed = visibleIndex < revealedLetterCount;
        let displayChar = "";

        if (isRevealed) {
          // Revealed letter from correct word
          displayChar = char;
        } else if (visibleIndex - revealedLetterCount < value.length) {
          // User input letter
          displayChar = value[visibleIndex - revealedLetterCount] || "";
        }

        const isActive = activeIndex === visibleIndex;
        const isUserInput =
          !isRevealed && visibleIndex - revealedLetterCount < value.length;

        // Add extra spacing if this is the start of a new word (but not the first word)
        const extraMargin =
          inWord === false && currentWordStart > 0 ? styles.wordSpacing : null;
        inWord = true;

        result.push(
          <TouchableOpacity
            key={i}
            onPress={handlePress}
            style={[
              styles.letterBox,
              theme === "dark" ? styles.darkBox : styles.lightBox,
              isActive && styles.focused,
              isRevealed && styles.revealedBox,
              isWrongAnswer && isUserInput && styles.wrongAnswerBox,
              isRevealed && isWrongAnswer && styles.revealedNoErrorBox,
              extraMargin,
            ]}
            activeOpacity={0.8}
            disabled={isRevealed}
          >
            <Text
              style={[
                styles.letter,
                theme === "dark" ? styles.darkText : styles.lightText,
                isRevealed && styles.revealedText,
                isWrongAnswer && isUserInput && styles.wrongAnswerText,
              ]}
            >
              {displayChar.toLocaleLowerCase()}
            </Text>
          </TouchableOpacity>
        );

        visibleIndex++;
      }
    }

    return result;
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChangeText}
        maxLength={availableSlots}
        autoCapitalize="characters"
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        onKeyPress={handleKeyPress}
        blurOnSubmit={false}
        keyboardType="default"
        contextMenuHidden={true}
        showSoftInputOnFocus={true}
        caretHidden={true}
      />
      <Animated.View
        style={[
          styles.visualContainer,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        {createBoxes()}
      </Animated.View>
    </View>
  );
};

const createStyles = (
  theme: string,
  themeObj: any,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number,
  boxWidth: number,
  boxHeight: number,
  fontSize: number
) =>
  StyleSheet.create({
    container: {
      width: "100%",
      alignItems: "center",
    },
    hiddenInput: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
    },
    visualContainer: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      maxWidth: "100%",
      paddingHorizontal: horizontalScale(5),
    },
    letterBox: {
      width: boxWidth,
      height: boxHeight,
      marginHorizontal: horizontalScale(2.5), // Reduced from 3 to 2.5
      marginVertical: verticalScale(2.5), // Reduced from 3 to 2.5
      borderWidth: horizontalScale(1),
      borderRadius: horizontalScale(8), // Reduced from 12 to 8
      justifyContent: "center",
      alignItems: "center",
    },
    letter: {
      fontSize: fontSize,
      fontFamily: "Semibold",
    },
    lightBox: {
      borderColor: lightTheme.primaryColor,
      backgroundColor: lightTheme.backgroundColor,
    },
    darkBox: {
      borderColor: darkTheme.primaryColor,
      backgroundColor: darkTheme.backgroundColor,
    },
    lightText: {
      color: lightTheme.textColor,
    },
    darkText: {
      color: darkTheme.textColor,
    },
    focused: {
      borderWidth: horizontalScale(2.5), // Reduced from 3 to 2.5
    },
    revealedBox: {
      borderColor: "gray",
    },
    revealedText: {
      color: "gray",
      fontWeight: "bold",
    },
    wrongAnswerBox: {
      borderColor: themeObj.errorColor,
      borderWidth: horizontalScale(2),
      backgroundColor: `${themeObj.errorColor}15`,
    },
    wrongAnswerText: {
      color: themeObj.errorColor,
      fontWeight: "bold",
    },
    revealedNoErrorBox: {
      borderColor: "gray",
    },
    wordSpacing: {
      marginLeft: horizontalScale(8), // Add extra space between words
    },
  });

export default AnswerInput;
