import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthenticationContext";

// Define the shape of our pyramid stats data
interface PyramidStatsData {
  time: string;
  sentences: string;
  successRate: string;
}

// Define the shape of our context
interface PyramidStatsContextType {
  stats: PyramidStatsData;
  updateStats: (newStats: Partial<PyramidStatsData>) => void;
  isLoading: boolean;
  error: string | null;
  // Sayısal değerlere erişim için yeni yardımcı fonksiyonlar
  timeInSeconds: number;
  sentencesCount: number;
  successRateValue: number;
  incrementTime: (seconds: number) => void;
  incrementSentences: (count: number) => void;
  setSuccessRate: (rate: number) => void;
}

// Zaman formatı helpers
const formatTimeString = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const parseTimeToSeconds = (timeStr: string): number => {
  let seconds = 0;
  const minutesMatch = timeStr.match(/(\d+)m/);
  if (minutesMatch && minutesMatch[1]) {
    seconds += parseInt(minutesMatch[1], 10) * 60;
  }

  const secondsMatch = timeStr.match(/(\d+)s/);
  if (secondsMatch && secondsMatch[1]) {
    seconds += parseInt(secondsMatch[1], 10);
  }

  return seconds;
};

const parseSuccessRate = (rateStr: string): number => {
  return parseFloat(rateStr.replace("%", ""));
};

// Create the context with default values
const PyramidStatsContext = createContext<PyramidStatsContextType>({
  stats: {
    time: "0m 0s",
    sentences: "0",
    successRate: "0%",
  },
  updateStats: () => {},
  isLoading: false,
  error: null,
  timeInSeconds: 0,
  sentencesCount: 0,
  successRateValue: 0,
  incrementTime: () => {},
  incrementSentences: () => {},
  setSuccessRate: () => {},
});

// Create the provider component
export const PyramidStatsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [stats, setStats] = useState<PyramidStatsData>({
    time: "0m 0s",
    sentences: "0",
    successRate: "0%",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Faydalı sayısal değerler
  const timeInSeconds = parseTimeToSeconds(stats.time);
  const sentencesCount = parseInt(stats.sentences, 10);
  const successRateValue = parseSuccessRate(stats.successRate);

  const apiURL = process.env.EXPO_PUBLIC_API_URL;

  // Fetch stats from API
  const fetchStats = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiURL}/statistics/get/pyramid`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.pyramid) {
        setStats(response.data.pyramid);
      }
    } catch (err) {
      console.error("Failed to fetch pyramid stats:", err);
      setError("İstatistikler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats through API
  const updateStats = async (newStats: Partial<PyramidStatsData>) => {
    if (!token) return;

    setIsLoading(true);

    try {
      const response = await axios.put(
        `${apiURL}/statistics/update/pyramid`,
        newStats,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        setStats((prevStats) => ({ ...prevStats, ...newStats }));
      }
    } catch (err) {
      console.error("Failed to update pyramid stats:", err);
      setError("İstatistikler güncellenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Convenience methods for incrementing values
  const incrementTime = (seconds: number) => {
    const newTimeInSeconds = timeInSeconds + seconds;
    updateStats({ time: formatTimeString(newTimeInSeconds) });
  };

  const incrementSentences = (count: number = 1) => {
    const newCount = sentencesCount + count;
    updateStats({ sentences: newCount.toString() });
  };

  const setSuccessRate = (rate: number) => {
    updateStats({ successRate: `${rate.toFixed(1)}%` });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <PyramidStatsContext.Provider
      value={{
        stats,
        updateStats,
        isLoading,
        error,
        timeInSeconds,
        sentencesCount,
        successRateValue,
        incrementTime,
        incrementSentences,
        setSuccessRate,
      }}
    >
      {children}
    </PyramidStatsContext.Provider>
  );
};

// Custom hook for using the pyramid stats context
export const usePyramidStats = () => {
  const context = useContext(PyramidStatsContext);
  if (context === undefined) {
    throw new Error(
      "usePyramidStats must be used within a PyramidStatsProvider"
    );
  }
  return context;
};