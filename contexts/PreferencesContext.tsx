import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PreferencesContextType {
  vibrationEnabled: boolean;
  soundEffectsEnabled: boolean;
  toggleVibration: () => void;
  toggleSoundEffects: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}

export default function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(true);

  // Load preferences from AsyncStorage when component mounts
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load vibration preference
        const vibrationPref = await AsyncStorage.getItem("vibrationEnabled");
        if (vibrationPref !== null) {
          setVibrationEnabled(vibrationPref === "true");
        }

        // Load sound effects preference
        const soundPref = await AsyncStorage.getItem("soundEffectsEnabled");
        if (soundPref !== null) {
          setSoundEffectsEnabled(soundPref === "true");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };
    
    loadPreferences();
  }, []);

  // Toggle vibration feedback
  const toggleVibration = async () => {
    try {
      const newValue = !vibrationEnabled;
      setVibrationEnabled(newValue);
      await AsyncStorage.setItem("vibrationEnabled", String(newValue));
    } catch (error) {
      console.error("Error saving vibration preference:", error);
    }
  };

  // Toggle sound effects
  const toggleSoundEffects = async () => {
    try {
      const newValue = !soundEffectsEnabled;
      setSoundEffectsEnabled(newValue);
      await AsyncStorage.setItem("soundEffectsEnabled", String(newValue));
    } catch (error) {
      console.error("Error saving sound effects preference:", error);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        vibrationEnabled,
        soundEffectsEnabled,
        toggleVibration,
        toggleSoundEffects
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}