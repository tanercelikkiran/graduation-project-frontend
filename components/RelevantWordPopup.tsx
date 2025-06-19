import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";

type RelevantWordPopupProps = {
  visible: boolean; // Gösterilip gösterilmeyeceği
  word: string; // Gösterilecek kelime
  emoji?: string; // Optional emoji to display with the word
  onClose: () => void; // Dışarıya tıklayınca veya kapatmak istediğinizde çağırılacak fonksiyon
};

export default function RelevantWordPopup({
  visible,
  word,
  emoji,
  onClose,
}: RelevantWordPopupProps) {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(
    theme,
    horizontalScale,
    verticalScale,
    horizontalScale(50)
  );

  // Popup'ın ekran konumu için state
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  // View referansı
  const popupRef = useRef<View>(null);

  // Layout ölçümü sonrası popup'ın pozisyonunu ayarlama
  const onLayout = () => {
    popupRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // Ekran boyutuna göre konumu ayarla
      const verticalOffset = verticalScale(0); // Responsive vertical offset
      setPopupPosition({
        x: pageX,
        y: -height - verticalOffset,
      });
    });
  };

  // Eğer görünür değilse, hiç render etme
  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View
        ref={popupRef}
        style={[styles.popupContainer, { top: popupPosition.y }]}
        onLayout={onLayout}
      >
        <View style={styles.bubbleTail} />
        <View style={styles.popup}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <Text style={styles.word}>{word}</Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number,
  minWidth: number
) =>
  StyleSheet.create({
    popupContainer: {
      position: "absolute",
      zIndex: 10,
      alignItems: "center",
    },
    popup: {
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      padding: horizontalScale(5),
      borderRadius: horizontalScale(8),
      elevation: 5,
      alignItems: "center",
      width: "auto", // Allow the width to grow if needed
    },
    bubbleTail: {
      position: "absolute",
      bottom: verticalScale(-6),
      left: "50%",
      transform: [{ translateX: horizontalScale(-6) }, { rotate: "45deg" }],
      width: horizontalScale(12),
      height: verticalScale(12),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      elevation: 5,
    },
    wordContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    emoji: {
      fontSize: horizontalScale(16),
      marginRight: horizontalScale(5),
    },
    word: {
      fontSize: horizontalScale(14),
      fontFamily: "SemiBold",
      textAlign: "center",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      padding: horizontalScale(5),
    },
  });
