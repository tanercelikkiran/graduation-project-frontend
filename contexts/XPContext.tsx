import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthenticationContext";

// Context interface
interface XPContextType {
  xp: number;
  isLoading: boolean;
  fetchXP: () => Promise<void>;
  addXP: (amount: number) => Promise<boolean>;
}

// Create the context
const XPContext = createContext<XPContextType | undefined>(undefined);

// Hook for using the XP context
export const useXP = () => {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error("useXP must be used within an XPProvider");
  }
  return context;
};

// Provider component
export const XPProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [xp, setXP] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { token } = useAuth();

  // Fetch XP data from backend
  const fetchXP = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/xp/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.xp !== undefined) {
        setXP(response.data.xp);
      }
    } catch (error) {
      console.error("Error fetching XP data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add XP to user account
  const addXP = async (amount: number): Promise<boolean> => {
    if (!token || amount <= 0) return false;

    setIsLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.post(
        `${apiUrl}/xp/add`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        // Update local XP state
        setXP((prevXP) => prevXP + amount);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding XP:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch XP data when the component mounts
  useEffect(() => {
    fetchXP();
  }, []); // Fetch XP when component mounts

  return (
    <XPContext.Provider value={{ xp, isLoading, fetchXP, addXP }}>
      {children}
    </XPContext.Provider>
  );
};
