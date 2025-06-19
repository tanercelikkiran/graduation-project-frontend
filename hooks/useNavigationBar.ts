import { useEffect, useCallback } from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";

/**
 * Custom hook to hide the navigation bar on Android devices
 * This hook ensures the navigation bar stays hidden throughout the app
 * and handles app state changes to maintain the hidden state
 */
export const useNavigationBar = () => {
  const hideNavigationBar = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        console.warn("Failed to hide navigation bar:", error);
      }
    }
  }, []);

  const showNavigationBar = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setVisibilityAsync("visible");
      } catch (error) {
        console.warn("Failed to show navigation bar:", error);
      }
    }
  }, []);

  // Hide navigation bar on initial load
  useEffect(() => {
    hideNavigationBar();
  }, [hideNavigationBar]);

  // Handle app state changes - re-hide when app becomes active
  useEffect(() => {
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
  }, [hideNavigationBar]);

  // Re-hide navigation bar when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      hideNavigationBar();
    }, [hideNavigationBar])
  );

  return {
    hideNavigationBar,
    showNavigationBar,
  };
};
