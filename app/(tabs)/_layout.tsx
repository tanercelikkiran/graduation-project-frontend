import { View, StyleSheet } from "react-native";
import { Tabs, useSegments } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/themes/Themes";
import { useNavigationBar } from "@/hooks/useNavigationBar";

import PyramidEmptyLight from "@/assets/icons/Pyramid Empty Light.svg";
import PyramidEmptyDark from "@/assets/icons/Pyramid Empty Dark.svg";
import PyramidFilledBlue from "@/assets/icons/Pyramid Filled Blue.svg";
import VocabularyEmptyLight from "@/assets/icons/Vocabulary Light.svg";
import VocabularyEmptyDark from "@/assets/icons/Vocabulary Dark.svg";
import VocabularyFilledBlue from "@/assets/icons/Vocabulary Blue.svg";
import HomeEmptyLight from "@/assets/icons/Home Empty Light.svg";
import HomeEmptyDark from "@/assets/icons/Home Empty Dark.svg";
import HomeFilledBlue from "@/assets/icons/Home Filled Blue.svg";
import WritingEmptyLight from "@/assets/icons/Writing Empty Light.svg";
import WritingEmptyDark from "@/assets/icons/Writing Empty Dark.svg";
import WritingFilledBlue from "@/assets/icons/Writing Filled Blue.svg";
import EmailEmptyLight from "@/assets/icons/Email Empty Light.svg";
import EmailEmptyDark from "@/assets/icons/Email Empty Dark.svg";
import EmailFilledBlue from "@/assets/icons/Email Filled Blue.svg";

export default function TabLayout() {
  const segments = useSegments();
  const { theme } = useTheme();

  // Ensure navigation bar stays hidden in tab layouts
  useNavigationBar();
  const isTabBarHidden =
    segments[2] === "quiz" ||
    segments[2] === "pyramid" ||
    segments[2] === "question" ||
    (segments.length > 4 && segments[4] === "expand") ||
    (segments.length > 4 && segments[4] === "replace") ||
    (segments.length > 4 && segments[4] === "shrink") ||
    (segments.length > 4 && segments[4] === "paraphrase") ||
    (segments.length > 4 && segments[4] === "questions");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarStyle: {
          backgroundColor:
            theme === "dark"
              ? darkTheme.surfaceBlackColor
              : lightTheme.surfaceWhiteColor,
          height: isTabBarHidden ? 0 : 56,
          borderTopWidth: 0,
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
      }}
    >
      {/* Pyramids Tab */}
      <Tabs.Screen
        name="pyramid-module"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              {focused ? (
                <PyramidFilledBlue width={32} height={32} />
              ) : theme === "dark" ? (
                <PyramidEmptyDark width={32} height={32} />
              ) : (
                <PyramidEmptyLight width={32} height={32} />
              )}
            </View>
          ),
        }}
      />

      {/* Vocabulary Tab */}
      <Tabs.Screen
        name="vocabulary-module"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              {focused ? (
                <VocabularyFilledBlue width={33} height={33} />
              ) : theme === "dark" ? (
                <VocabularyEmptyDark width={32} height={32} />
              ) : (
                <VocabularyEmptyLight width={32} height={32} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              {focused ? (
                <HomeFilledBlue width={22} height={24} />
              ) : theme === "dark" ? (
                <HomeEmptyDark width={22} height={24} />
              ) : (
                <HomeEmptyLight width={22} height={24} />
              )}
            </View>
          ),
        }}
      />

      {/* Writing Tab */}
      <Tabs.Screen
        name="writing-module"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              {focused ? (
                <WritingFilledBlue width={32} height={32} />
              ) : theme === "dark" ? (
                <WritingEmptyDark width={32} height={32} />
              ) : (
                <WritingEmptyLight width={32} height={32} />
              )}
            </View>
          ),
        }}
      />

      {/* Email Tab */}
      <Tabs.Screen
        name="email-module"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              {focused ? (
                <EmailFilledBlue width={28} height={28} />
              ) : theme === "dark" ? (
                <EmailEmptyDark width={28} height={28} />
              ) : (
                <EmailEmptyLight width={28} height={28} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tab: {
    width: 70,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  }
});
