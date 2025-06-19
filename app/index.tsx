import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function IndexScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  // Ensure navigation bar stays hidden on index screen
  useNavigationBar();

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    // Platform'a göre bağlantı kontrolü yap
    if (Platform.OS !== "web") {
      const checkConnection = async () => {
        try {
          // fetch ile basit bir HTTP isteği yap
          const response = await fetch("https://www.google.com");
          setIsOnline(response.ok);
        } catch (error) {
          setIsOnline(false);
        }
      };

      // İlk kontrol
      checkConnection();

      // Her 5 saniyede bir kontrol et
      let interval = setInterval(checkConnection, 5000);

      // Web dışı platformlar için splash'e yönlendirme
      if (isOnline) {
        const timeout = setTimeout(() => {
          router.replace("/splash");
        }, 600);
        return () => {
          clearTimeout(timeout);
          if (interval) clearInterval(interval);
        };
      }
    } else {
      // Web için direkt splash'e yönlendirme
      const timeout = setTimeout(() => {
        router.replace("/splash");
      }, 600);
      return () => clearTimeout(timeout);
    }

    // Genel temizleme
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []); // Boş dependency array kullan

  if (!isOnline) {
    router.replace("./offline");
  }

  return null;
}
