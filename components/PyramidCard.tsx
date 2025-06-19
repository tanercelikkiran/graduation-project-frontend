import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  ScrollView,
  Alert,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { usePyramidList } from "../contexts/PyramidListContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next"; // Assuming this is the correct import
import { Ionicons } from "@expo/vector-icons"; // For the delete icon

import PyramidsSelected from "@/assets/icons/Pyramid Filled Dark.svg";
import PyramidsPlainLight from "@/assets/icons/Pyramid Empty Light.svg";
import PyramidsPlainDark from "@/assets/icons/Pyramid Empty Dark.svg";

import ArrowIconLight from "@/assets/icons/Short Arrow Down Light.svg";
import ArrowIconDark from "@/assets/icons/Short Arrow Down Dark.svg";

import StatisticsIconDark from "@/assets/icons/Statistics Dark.svg";
import StatisticsIconLight from "@/assets/icons/Statistics Light.svg";

import TextIconDark from "@/assets/icons/Text Dark.svg"; // Added for "Look up sentences"
import TextIconLight from "@/assets/icons/Text Light.svg"; // Added for "Look up sentences"
import { useScale } from "@/hooks/useScale";

interface PyramidCartProps {
  isSelected: boolean;
  title: string;
  pyramidId: string;
  onPress?: () => void;
}

export default function PyramidCard({
  isSelected,
  title,
  pyramidId,
  onPress,
}: PyramidCartProps) {
  const { expandedPyramidId, setExpandedPyramidId, deletePyramid } = usePyramidList();
  const [loading, setLoading] = useState<boolean>(false);
  const animation = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation(); // Added for button text

  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  // Determine if this card is expanded
  const isExpanded = expandedPyramidId === title;

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const handlePress = () => {
    // Seçim işlemini çağır
    if (onPress) {
      onPress(); // Bu fonksiyon artık toggle işlevi yapacak
    }

    if (isSelected) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedPyramidId(null);
    } else {
      // Yeni bir kart seçildiyse, genişlet
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedPyramidId(title);
    }
  };

  // Update animation value when expandedPyramidId changes
  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expandedPyramidId]);

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, verticalScale(60)],
  });

  // Add rotation interpolation for the action icon
  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleDeletePyramid = () => {
    Alert.alert(
      t("modules.pyramid.delete.title", "Delete Pyramid"),
      t("modules.pyramid.delete.message", "Are you sure you want to delete this pyramid? This action cannot be undone."),
      [
        {
          text: t("common.cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete", "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deletePyramid(pyramidId);
            } catch (error) {
              console.error('Error deleting pyramid:', error);
              Alert.alert(
                t("errors.title", "Error"),
                t("errors.failedToDeletePyramid", "Failed to delete pyramid. Please try again.")
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const Container = isSelected
    ? ({ children }: { children: React.ReactNode }) => (
        <TouchableOpacity
          style={styles.itemContainerSelected}
          onPress={handlePress}
        >
          {children}
        </TouchableOpacity>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
          {children}
        </TouchableOpacity>
      );

  return (
    <View>
      <Container>
        {isSelected ? (
          <PyramidsSelected
            style={styles.iconSelected}
            width={horizontalScale(30)}
            height={verticalScale(30)}
          />
        ) : theme === "dark" ? (
          <PyramidsPlainDark
            style={styles.iconPlain}
            width={horizontalScale(30)}
            height={verticalScale(30)}
          />
        ) : (
          <PyramidsPlainLight
            style={styles.iconPlain}
            width={horizontalScale(30)}
            height={verticalScale(30)}
          />
        )}
        <Text style={[styles.title, isSelected && styles.titleSelected]}>
          {title}
        </Text>
        <View style={styles.iconGroup}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            {isSelected ? (
              <ArrowIconDark style={styles.miniIcon} />
            ) : theme === "dark" ? (
              <ArrowIconDark style={styles.miniIcon} />
            ) : (
              <ArrowIconLight style={styles.miniIcon} />
            )}
          </Animated.View>
        </View>
      </Container>

      <Animated.View
        style={[styles.expandableView, { height: heightInterpolate }]}
      >
        {isExpanded && (
          <ScrollView style={styles.expandedContent}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton}>
                {theme === "dark" ? (
                  <StatisticsIconDark
                    width={horizontalScale(20)}
                    height={verticalScale(20)}
                  />
                ) : (
                  <StatisticsIconLight
                    width={horizontalScale(20)}
                    height={verticalScale(20)}
                  />
                )}
                <Text style={styles.buttonText}>
                  {t("modules.pyramid.buttons.statistics", "Statistics")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                {theme === "dark" ? (
                  <TextIconDark width={horizontalScale(20)} height={verticalScale(20)} />
                ) : (
                  <TextIconLight width={horizontalScale(20)} height={verticalScale(20)} />
                )}
                <Text style={styles.buttonText}>
                  {t("modules.pyramid.buttons.sentences", "Sentences")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeletePyramid}
              >
                <Ionicons
                  name="trash-outline"
                  size={horizontalScale(20)}
                  color={
                    theme === "dark"
                      ? darkTheme.errorColor
                      : lightTheme.errorColor
                  }
                />
                <Text style={styles.buttonText}>
                  {t("modules.pyramid.buttons.delete", "Delete")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.cardBackgroundColor,
      padding: horizontalScale(12),
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(8),
      marginHorizontal: horizontalScale(16),
    },
    itemContainerSelected: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: darkTheme.primaryColor,
      padding: horizontalScale(12),
      borderRadius: horizontalScale(12),
      marginBottom: verticalScale(8),
      marginHorizontal: horizontalScale(16),
    },
    iconSelected: {
      width: horizontalScale(48),
      height: verticalScale(48),
      resizeMode: "center",
    },
    iconPlain: {
      width: horizontalScale(48),
      height: verticalScale(48),
      resizeMode: "center",
    },
    title: {
      flex: 1,
      fontFamily: "Medium",
      fontSize: horizontalScale(18),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginHorizontal: horizontalScale(12),
    },
    titleSelected: {
      color: darkTheme.textColor,
    },
    iconGroup: {
      flexDirection: "column",
      alignItems: "center",
    },
    miniIcon: {
      fontSize: horizontalScale(16),
      marginVertical: verticalScale(4),
    },
    expandableView: {
      overflow: "hidden",
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      marginHorizontal: horizontalScale(16),
      borderRadius: horizontalScale(8),
      marginBottom: verticalScale(8),
    },
    expandedContent: {
      paddingTop: verticalScale(5),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
    },
    buttonText: {
      fontFamily: "Regular",
      fontSize: horizontalScale(10),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    buttonRow: {
      alignContent: "center",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    secondaryButton: {
      // backgroundColor: darkTheme.primaryColor, // Removed background
      borderRadius: horizontalScale(8),
      paddingVertical: verticalScale(8),
      paddingHorizontal: horizontalScale(8),
      alignItems: "center",
      justifyContent: "center",
      flex: 0.225, // Adjusted to fit all four buttons
    },
    deleteButton: {
      // backgroundColor: darkTheme.errorColor, // Removed background
      borderRadius: horizontalScale(8),
      paddingVertical: verticalScale(8),
      paddingHorizontal: horizontalScale(8),
      alignItems: "center",
      justifyContent: "center",
      flex: 0.225,
    },
  });
