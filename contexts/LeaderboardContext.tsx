import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthenticationContext";

// Leaderboard öğesi tipi
export type LeaderboardItemType = {
  rank: number;
  username: string;
  xp: number;
};

// Context için tip tanımlaması
interface LeaderboardContextType {
  leaderboardData: LeaderboardItemType[];
  isLoading: boolean;
  refreshLeaderboard: () => void;
}

// Context'i oluştur
const LeaderboardContext = createContext<LeaderboardContextType>({
  leaderboardData: [],
  isLoading: true,
  refreshLeaderboard: () => {},
});

// Hook olarak kullanmak için
export const useLeaderboard = () => useContext(LeaderboardContext);

// Provider bileşeni
export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItemType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { t } = useTranslation();

  // Leaderboard verilerini yükleme fonksiyonu
  const fetchLeaderboardData = async () => {
    setIsLoading(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      // Kullanıcı sıralamasını al
      const response = await axios.get(`${apiUrl}/leaderboard/get/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ContentType: "application/json",
        },
      });
      // API yanıtından leaderboard verisini çıkar ve state'e kaydet
      if (response.data && response.data.leaderboard) {
        // "You" kullanıcı adını çevir
        const updatedLeaderboard = response.data.leaderboard.map(
          (item: LeaderboardItemType) => {
            if (item.username === "You") {
              return { ...item, username: t("leaderboard.you") };
            }
            return item;
          }
        );
        setLeaderboardData(updatedLeaderboard);
      } else {
        console.error(
          "Leaderboard verisi beklenen formatta değil:",
          response.data
        );
        // Beklenmedik format durumunda örnek veri kullan
        setLeaderboardData([
          { rank: 1, username: "user1", xp: 300 },
          { rank: 2, username: "user2", xp: 200 },
          { rank: 3, username: "user3", xp: 150 },
          { rank: 4, username: t("leaderboard.you"), xp: 100 },
        ]);
      }
    } catch (error) {
      console.error("Leaderboard verisi alınamadı:", error);

      // Hata durumunda örnek veriler göster
      setLeaderboardData([
        { rank: 1, username: "user1", xp: 300 },
        { rank: 2, username: "user2", xp: 200 },
        { rank: 3, username: "user3", xp: 150 },
        { rank: 4, username: t("leaderboard.you"), xp: 100 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Token değiştiğinde verileri yükle
  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboardData,
        isLoading,
        refreshLeaderboard: fetchLeaderboardData,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};
