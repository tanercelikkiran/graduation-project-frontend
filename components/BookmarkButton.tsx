import React, { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import BookmarkEmptyLight from "@/assets/icons/Bookmark Empty Light.svg";
import BookmarkEmptyDark from "@/assets/icons/Bookmark Empty Dark.svg";
import BookmarkFilledLight from "@/assets/icons/Bookmark Filled Light.svg";
import BookmarkFilledDark from "@/assets/icons/Bookmark Filled Dark.svg";
import { useScale } from "@/hooks/useScale";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookmarkButtonProps {
  onPress?: () => void;
  style?: object;
  isBookmarked?: boolean;
}

export const BookmarkButton = ({
  onPress,
  style,
  isBookmarked: externalIsBookmarked,
}: BookmarkButtonProps) => {
  const [internalIsBookmarked, setInternalIsBookmarked] = useState(false);
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Sync with external state if provided
  useEffect(() => {
    if (externalIsBookmarked !== undefined) {
      setInternalIsBookmarked(externalIsBookmarked);
    }
  }, [externalIsBookmarked]);

  const handlePress = () => {
    // Only update internal state if no external state is provided
    if (externalIsBookmarked === undefined) {
      setInternalIsBookmarked(!internalIsBookmarked);
    }
    if (onPress) onPress();
  };

  // Use external state if provided, otherwise use internal state
  const showBookmarked =
    externalIsBookmarked !== undefined
      ? externalIsBookmarked
      : internalIsBookmarked;

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[styles.container, style]}
    >
      {showBookmarked ? (
        theme === "dark" ? (
          <BookmarkFilledDark
            width={horizontalScale(24)}
            height={verticalScale(24)}
          />
        ) : (
          <BookmarkFilledLight
            width={horizontalScale(24)}
            height={verticalScale(24)}
          />
        )
      ) : theme === "dark" ? (
        <BookmarkEmptyDark
          width={horizontalScale(24)}
          height={verticalScale(24)}
        />
      ) : (
        <BookmarkEmptyLight
          width={horizontalScale(24)}
          height={verticalScale(24)}
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: verticalScale(10),
      right: 0,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
      borderRadius: horizontalScale(5),
    },
  });
