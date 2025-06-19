import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthenticationContext";

// Define the shape of vocabulary stats
interface VocabularyStats {
  time: string;
  vocabularies: string;
  successRate: string;
}

// Default values
const defaultStats: VocabularyStats = {
  time: "0m 0s",
  vocabularies: "0",
  successRate: "0%",
};

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

// Create context with extended interface
const VocabularyStatsContext = createContext<{
  stats: VocabularyStats;
  updateStats: (newStats: Partial<VocabularyStats>) => void;
  isLoading: boolean;
  error: string | null;
  timeInSeconds: number;
  vocabulariesCount: number;
  successRateValue: number;
  incrementTime: (seconds: number) => void;
  incrementVocabularies: (count: number) => void;
  setSuccessRate: (rate: number) => void;
  checkAndUpdateVocabularyStats: () => void;
  refreshStats: () => Promise<void>;
}>({
  stats: defaultStats,
  updateStats: () => {},
  isLoading: false,
  error: null,
  timeInSeconds: 0,
  vocabulariesCount: 0,
  successRateValue: 0,
  incrementTime: () => {},
  incrementVocabularies: () => {},
  setSuccessRate: () => {},
  checkAndUpdateVocabularyStats: () => {},
  refreshStats: async () => {},
});

// Provider component
export function VocabularyStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<VocabularyStats>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // accessToken yerine token kullanıyoruz

  // Faydalı sayısal değerler
  const timeInSeconds = parseTimeToSeconds(stats.time);
  const vocabulariesCount = parseInt(stats.vocabularies, 10);
  const successRateValue = parseSuccessRate(stats.successRate);

  const apiURL = process.env.EXPO_PUBLIC_API_URL;

  // Fetch stats from API
  const fetchStats = async () => {
    setIsLoading(true);
    0;
    setError(null);

    try {
      const response = await axios.get(`${apiURL}/statistics/get/vocabulary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.vocabulary) {
        setStats(response.data.vocabulary);
      } else {
        setStats(defaultStats);
      }
    } catch (err) {
      console.error("Failed to fetch vocabulary stats:", err);
      if (axios.isAxiosError(err)) {
        console.error("Axios error details:", {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers,
          message: err.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats through API
  const updateStats = async (newStats: Partial<VocabularyStats>) => {
    if (!token) {
      console.error("Cannot update stats: No authentication token available");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(
        `${apiURL}/statistics/update/vocabulary`,
        { ...newStats },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data);

      if (response.data && response.data.status === "success") {
        setStats((prevStats) => ({ ...prevStats, ...newStats }));
      } else {
        console.warn("Stats update response not as expected:", response.data);
      }
    } catch (err) {
      console.error("Failed to update vocabulary stats:", err);
      if (axios.isAxiosError(err)) {
        console.error("Axios error details:", {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers,
          message: err.message,
        });
      }
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

  const incrementVocabularies = (count: number = 1) => {
    const newCount = vocabulariesCount + count;
    updateStats({ vocabularies: newCount.toString() });
  };

  const setSuccessRate = (rate: number) => {
    updateStats({ successRate: `${rate.toFixed(1)}%` });
  };

  // Function to check if we need to fetch a new module
  const checkAndUpdateVocabularyStats = async () => {
    try {
      // Check if stats are already fetched
      if (stats.time !== defaultStats.time) {
        console.log("Vocabulary stats already fetched, skipping fetch.");
        return;
      }

      // Check if token is available
      if (!token) {
        console.log("No authentication token available, skipping fetch.");
        return;
      }

      console.log("Fetching vocabulary stats...");
      await fetchStats();
    } catch (error) {
      console.error("Error checking/updating vocabulary stats:", error);
    }
  };

  useEffect(() => {
    checkAndUpdateVocabularyStats();
  }, [token]); // Fetch stats when token or userId changes

  return (
    <VocabularyStatsContext.Provider
      value={{
        stats,
        updateStats,
        isLoading,
        error,
        timeInSeconds,
        vocabulariesCount,
        successRateValue,
        incrementTime,
        incrementVocabularies,
        setSuccessRate,
        checkAndUpdateVocabularyStats,
        refreshStats: fetchStats,
      }}
    >
      {children}
    </VocabularyStatsContext.Provider>
  );
}

// Custom hook to use the context
export function useVocabularyStats() {
  const context = useContext(VocabularyStatsContext);
  if (context === undefined) {
    throw new Error(
      "useVocabularyStats must be used within a VocabularyStatsProvider"
    );
  }
  return context;
}
