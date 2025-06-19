import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useTranslation } from "react-i18next";

// Define type for weekly progress data
interface WeeklyProgressDataType {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }[];
}

// Define context type
interface WeeklyProgressContextType {
  weeklyProgressData: WeeklyProgressDataType;
  isLoading: boolean;
  refreshWeeklyProgressData: () => void;
}

// Create context with default values
const WeeklyProgressContext = createContext<WeeklyProgressContextType>({
  weeklyProgressData: {
    labels: [],
    datasets: [{ data: [] }],
  },
  isLoading: true,
  refreshWeeklyProgressData: () => {},
});

// Custom hook to use this context
export const useWeeklyProgress = () => useContext(WeeklyProgressContext);

// Provider component
export const WeeklyProgressProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [weeklyProgressData, setWeeklyProgressData] =
    useState<WeeklyProgressDataType>({
      labels: [],
      datasets: [{ data: [] }],
    });
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  // Function to fetch weekly progress data
  const { t } = useTranslation();

  const getDayLabel = (dayIndex: number): string => {
    const dayMap: { [key: string]: string } = {
      'monday': t('progress.weekDays.mon'),
      'tuesday': t('progress.weekDays.tue'),
      'wednesday': t('progress.weekDays.wed'),
      'thursday': t('progress.weekDays.thu'),
      'friday': t('progress.weekDays.fri'),
      'saturday': t('progress.weekDays.sat'),
      'sunday': t('progress.weekDays.sun'),
    };
    return dayMap[dayIndex] || dayMap[dayIndex.toString()] || '';
  };

  const fetchWeeklyProgressData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/weekly-progress/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const rawLabels = response.data.labels;
      const data = response.data.data;

      // Backend'den gelen indeksleri çevirilmiş etiketlere dönüştür
      const translatedLabels = rawLabels.map((dayIndex: number) => getDayLabel(dayIndex));

      setWeeklyProgressData({
        labels: translatedLabels,
        datasets: [
          {
            data: data,
            color: (opacity = 1) => `rgba(108, 11, 188, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error("Weekly progress verisi yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    fetchWeeklyProgressData();
  }, []);

  // Verileri yenileme fonksiyonu
  const refreshWeeklyProgressData = () => {
    fetchWeeklyProgressData();
  };

  return (
    <WeeklyProgressContext.Provider
      value={{
        weeklyProgressData,
        isLoading,
        refreshWeeklyProgressData,
      }}
    >
      {children}
    </WeeklyProgressContext.Provider>
  );
};
