import React, { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, AppState, AppStateStatus } from "react-native";
import ThemeProvider from "@/contexts/ThemeContext";
import PreferencesProvider from "@/contexts/PreferencesContext";
import NotificationsProvider from "@/contexts/NotificationsContext";
import AuthProvider, { useAuth } from "@/contexts/AuthenticationContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { SavedSentencesProvider } from "@/contexts/SavedSentencesContext";
import axios from "axios";
import { syncUserLanguageWithFrontend } from "@/utils/languageSync";
import "@/src/i18n";

// App açılışını loglamak için ayrı bir komponent
const AppOpenLogger = () => {
  const { token } = useAuth();

  useEffect(() => {
    // Yalnızca kullanıcı giriş yapmışsa loglama yap
    const logAppOpen = async () => {
      if (token) {
        try {
          const apiUrl = process.env.EXPO_PUBLIC_API_URL;
          await axios.post(
            `${apiUrl}/log-app-open`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("App open event logged successfully");
        } catch (error) {
          console.error("Failed to log app open event:", error);
        }
      }
    };

    logAppOpen();
  }, [token]);

  return null; // Bu komponent herhangi bir UI render etmiyor
};

// Language sync component for when user is already logged in
const LanguageSync = () => {
  const { token } = useAuth();
  const { setInterfaceLanguage } = useLanguage();

  useEffect(() => {
    const syncLanguage = async () => {
      if (token) {
        await syncUserLanguageWithFrontend(token, setInterfaceLanguage);
      }
    };

    syncLanguage();
  }, [token, setInterfaceLanguage]);

  return null;
};

// Auth kontrol yapısını içeren bir layout oluşturalım
const AppContent = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PreferencesProvider>
          <NotificationsProvider>
            <SavedSentencesProvider>
              <AppOpenLogger />
              <LanguageSync />
              <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="splash" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="create-username" />
              <Stack.Screen name="create-password" />
              <Stack.Screen name="choose-language" />
              <Stack.Screen name="user-knowledge" />
              <Stack.Screen name="user-purpose" />
              <Stack.Screen name="user-level" />
              <Stack.Screen name="start" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="preferences" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="help" />
              <Stack.Screen name="feedback" />
              <Stack.Screen name="change-password" />
            </Stack>
            </SavedSentencesProvider>
          </NotificationsProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default function RootLayout() {
  const hideNavigationBar = async () => {
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        console.warn("Failed to hide navigation bar:", error);
      }
    }
  };

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    // Hide navigation bar on Android initially
    hideNavigationBar();

    // Handle app state changes to ensure navigation bar stays hidden
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        hideNavigationBar();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
