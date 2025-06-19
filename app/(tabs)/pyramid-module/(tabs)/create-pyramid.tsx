import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useScale } from "@/hooks/useScale";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import OrSeparator from "@/components/OrSeparator";

import CreatePyramidIllustrationLight from "@/assets/illustrations/Create Pyramid Light.svg";
import CreatePyramidIllustrationDark from "@/assets/illustrations/Create Pyramid Dark.svg";
import ReturnButton from "@/components/ReturnButton";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function CreatePyramidScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();
  const styles = createStyles(theme, horizontalScale, verticalScale);

  const [sentence, setSentence] = React.useState("");

  // Ensure navigation bar stays hidden in create pyramid screen
  useNavigationBar();

  return (

    <SafeAreaView style={styles.container}>
      {/* Back Button to navigate to the previous screen */}

      <ReturnButton />

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        {theme === "light" ? (
          <CreatePyramidIllustrationLight
            width={horizontalScale(350)}
            height={horizontalScale(350)}
          />
        ) : (
          <CreatePyramidIllustrationDark
            width={horizontalScale(350)}
            height={horizontalScale(350)}
          />
        )}
      </View>

      {/* Header */}
      <Text style={styles.header}>{t("modules.pyramid.createTitle")}</Text>

      <View style={styles.inputContainer}>
        <PrimaryButton
          title={t("modules.pyramid.createWithAI")}
          onPress={() => {
            router.navigate({
              pathname: "../pyramid",
              params: { customSentence: "" },
            });
            /* router.navigate({
              pathname: "../pyramid/result",
            }); */
          }}
        />

        {/* OR Separator */}
        <OrSeparator />

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder={t("modules.pyramid.enterSentence")}
          placeholderTextColor={
            theme === "dark" ? darkTheme.textColor : lightTheme.textColor
          }
          onChangeText={(text) => {
            setSentence(text);
          }}
        />

        <SecondaryButton
          title={t("common.continue")}
          onPress={() => {
            router.navigate({
              pathname: "../pyramid",
              params: { customSentence: sentence },
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme === "light"
          ? lightTheme.backgroundColor
          : darkTheme.backgroundColor,
    },
    header: {
      fontSize: horizontalScale(28),
      fontFamily: "Semibold",
      marginBottom: verticalScale(10),
      alignSelf: "center",
      textAlign: "center",
      color: theme === "light" ? lightTheme.textColor : darkTheme.textColor,
    },
    illustrationContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    inputContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingHorizontal: horizontalScale(10),
    },
    input: {
      width: horizontalScale(300),
      maxWidth: horizontalScale(360),
      height: verticalScale(50),
      borderWidth: 1,
      borderColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      borderRadius: horizontalScale(12),
      paddingHorizontal: horizontalScale(10),
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      marginBottom: verticalScale(15),
    },
  });
