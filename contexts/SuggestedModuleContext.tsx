import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthenticationContext";

// Define the possible module types
type ModuleType = "pyramid" | "vocabulary" | "writing" | "email";

// Define the context type
interface SuggestedModuleContextType {
  suggestedModule: ModuleType;
  loading: boolean;
  error: string | null;
  refreshSuggestedModule: () => Promise<void>;
}

// Create the context
const SuggestedModuleContext = createContext<
  SuggestedModuleContextType | undefined
>(undefined);

// Custom hook to use the context
export const useSuggestedModule = () => {
  const context = useContext(SuggestedModuleContext);
  if (!context) {
    throw new Error(
      "useSuggestedModule must be used within a SuggestedModuleProvider"
    );
  }
  return context;
};

// Context provider component
export const SuggestedModuleProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [suggestedModule, setSuggestedModule] = useState<ModuleType>("pyramid");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); 
  
  const fetchSuggestedModule = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiURL = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.get(`${apiURL}/suggested-module/get`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use the token from AuthContext
          "Content-Type": "application/json",
        },
      });

      if (response.data.module_type) {
        setSuggestedModule(response.data.module_type);

        // Save to AsyncStorage with current date
        await AsyncStorage.setItem(
          "suggestedModule",
          response.data.module_type
        );
        await AsyncStorage.setItem(
          "suggestedModuleDate",
          new Date().toISOString().split("T")[0]
        );
      }
    } catch (error) {
      console.error("Error fetching suggested module:", error);
      setError("Failed to fetch suggested module");
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh the suggested module
  const refreshSuggestedModule = async () => {
    await fetchSuggestedModule();
  };

  // Function to clear suggested module data
  const clearSuggestedModuleData = async () => {
    try {
      await AsyncStorage.removeItem("suggestedModule");
      await AsyncStorage.removeItem("suggestedModuleDate");
    } catch (error) {
      console.error("Error clearing suggested module data:", error);
    }
  };

  // Function to check if we need to fetch a new module
  const checkAndUpdateSuggestedModule = async () => {
    try {
      // Get stored values
      const storedModule = await AsyncStorage.getItem("suggestedModule");
      const storedDate = await AsyncStorage.getItem("suggestedModuleDate");
      const today = new Date().toISOString().split("T")[0];

      // If we have a stored module and it's from today, use it
      if (storedModule && storedDate === today) {
        setSuggestedModule(storedModule as ModuleType);
        setLoading(false);
      } else {
        // Otherwise fetch a new one
        await fetchSuggestedModule();
      }
    } catch (error) {
      console.error("Error reading from AsyncStorage:", error);
      setError("Failed to load suggested module data");
      setLoading(false);
    }
  };

  // Check for data on initial load
  useEffect(() => {
    checkAndUpdateSuggestedModule();
  }, []); // Run once on mount

  return (
    <SuggestedModuleContext.Provider
      value={{
        suggestedModule,
        loading,
        error,
        refreshSuggestedModule,
      }}
    >
      {children}
    </SuggestedModuleContext.Provider>
  );
};
