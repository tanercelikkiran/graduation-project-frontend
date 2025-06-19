import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthenticationContext';

// Context için tip tanımlaması
interface UserProgressContextType {
  progress: number;
  remaining: number;
  weeklyGoal: number;
  currentXP: number;
  isLoading: boolean;
  error: string | null;
  updateProgress: (newXP: number) => Promise<void>;
  setWeeklyGoal: (goal: number) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

// Context'i oluştur
const UserProgressContext = createContext<UserProgressContextType>({
  progress: 0,
  remaining: 0,
  weeklyGoal: 1000,
  currentXP: 0,
  isLoading: true,
  error: null,
  updateProgress: async () => {},
  setWeeklyGoal: async () => {},
  refreshProgress: async () => {},
});

// Hook olarak kullanmak için
export const useUserProgress = () => useContext(UserProgressContext);

// Provider bileşeni
export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [weeklyGoal, setWeeklyGoalState] = useState(1000);
  const [currentXP, setCurrentXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { token, hasCheckedToken } = useAuth();
  
  // İlerleme verilerini almak için
  const fetchProgress = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/user-progress/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const data = response.data;
      setProgress(data.progress);
      // API'den gelen remaining değerini sayıya dönüştür
      const remainingValue = typeof data.remaining === 'string'
        ? parseInt(data.remaining.replace(/[^0-9]/g, ''), 10)
        : Number(data.remaining) || 0;
      setRemaining(remainingValue);
      setWeeklyGoalState(data.weekly_goal);
      setCurrentXP(data.current_xp);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError("Failed to load progress data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // İlerleme verilerini güncellemek için
  const updateProgress = async (newXP: number) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.put(
        `${apiUrl}/user-progress/update`,
        { current_xp: newXP },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const data = response.data;
      setProgress(data.progress);
      // Update progress için de aynı dönüşümü uygula
      const remainingValue = typeof data.remaining === 'string'
        ? parseInt(data.remaining.replace(/[^0-9]/g, ''), 10)
        : Number(data.remaining) || 0;
      setRemaining(remainingValue);
      setCurrentXP(data.current_xp);
    } catch (err) {
      console.error("Error updating progress:", err);
      setError("Failed to update progress");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Haftalık hedefi güncellemek için
  const setWeeklyGoal = async (goal: number) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.put(
        `${apiUrl}/user-progress/update/weekly-goal`,
        { goal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const data = response.data;
      setProgress(data.progress);
      // Weekly goal güncellemesi için de aynı dönüşümü uygula
      const remainingValue = typeof data.remaining === 'string'
        ? parseInt(data.remaining.replace(/[^0-9]/g, ''), 10)
        : Number(data.remaining) || 0;
      setRemaining(remainingValue);
      setWeeklyGoalState(data.weekly_goal);
      setCurrentXP(data.current_xp);
    } catch (err) {
      console.error("Error setting weekly goal:", err);
      setError("Failed to set weekly goal");
    } finally {
      setIsLoading(false);
    }
  };
  // Verileri yenileme fonksiyonu
  const refreshProgress = async () => {
    await fetchProgress();
  };

  useEffect(() => {
    if (hasCheckedToken && token) {
      fetchProgress();
    } else if (hasCheckedToken && (!token)) {
      // Token yok veya kullanıcı ID yok, yükleme durumunu kapat
      setIsLoading(false);
    }
  }, [hasCheckedToken, token]);
  

  return (
    <UserProgressContext.Provider
      value={{
        progress,
        remaining,
        weeklyGoal,
        currentXP,
        isLoading,
        error,
        updateProgress,
        setWeeklyGoal,
        refreshProgress,
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
};
