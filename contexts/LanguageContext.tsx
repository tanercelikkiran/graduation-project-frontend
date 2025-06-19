import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "../src/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LanguageContextType = {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  interfaceLanguage: string;
  setInterfaceLanguage: (language: string) => void;
  availableLanguages: { code: string; name: string }[];
  interfaceLanguageOptions: {
    code: string;
    name: string;
    displayName: string;
    nativeName: string;
  }[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [interfaceLanguage, setInterfaceLanguageState] = useState("English");

  const availableLanguages = [
    { code: "tr", name: "Türkçe" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
  ];

  // Define interface language options
  const interfaceLanguageOptions = [
    {
      code: "en",
      name: "English",
      displayName: "English",
      nativeName: "English",
    },
    {
      code: "es",
      name: "Español",
      displayName: "Spanish",
      nativeName: "Español",
    },
    {
      code: "tr",
      name: "Türkçe",
      displayName: "Turkish",
      nativeName: "Türkçe",
    },
  ];

  // Language code mapping for i18n
  const languageCodeMap: Record<string, string> = {
    English: "en",
    Spanish: "es",
    Turkish: "tr",
  };

  // Load interface language preference from AsyncStorage
  useEffect(() => {
    const loadInterfaceLanguage = async () => {
      try {
        const langPref = await AsyncStorage.getItem("interfaceLanguage");
        if (langPref !== null) {
          setInterfaceLanguageState(langPref);

          // Also set current language for i18n if there's a valid mapping
          const langCode = languageCodeMap[langPref];
          if (langCode) {
            changeLanguage(langCode);
          }
        }
      } catch (error) {
        console.error("Error loading interface language:", error);
      }
    };

    loadInterfaceLanguage();
  }, []);

  // Set interface language and update i18n
  const setInterfaceLanguage = async (language: string) => {
    try {
      setInterfaceLanguageState(language);
      await AsyncStorage.setItem("interfaceLanguage", language);

      // Update the app language for i18n
      const langCode = languageCodeMap[language];
      if (langCode) {
        changeLanguage(langCode);
      }
    } catch (error) {
      console.error("Error saving interface language:", error);
    }
  };

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        interfaceLanguage,
        setInterfaceLanguage,
        availableLanguages,
        interfaceLanguageOptions,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
