import { useEffect, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter, SplashScreen as ExpoSplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useColorScheme } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useAuth } from "@/contexts/AuthenticationContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function Splash() {
  const router = useRouter();

  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Ensure navigation bar stays hidden during splash
  useNavigationBar();

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const [fontsLoaded] = useFonts({
    Regular: require("@/assets/fonts/SF-Pro-Text-Regular.otf"),
    Medium: require("@/assets/fonts/SF-Pro-Text-Medium.otf"),
    Semibold: require("@/assets/fonts/SF-Pro-Text-Semibold.otf"),
    Bold: require("@/assets/fonts/SF-Pro-Text-Bold.otf"),
  });

  // Auth durumunu kontrol et
  const { token, hasCheckedToken } = useAuth();

  useEffect(() => {
    async function prepareApp() {
      try {
        if (!fontsLoaded || !isImageLoaded) return; // Görsel ve fontlar tamamen yüklenmeden geçiş yapma

        // Expo Splash Screen'i gizle
        await ExpoSplashScreen.hideAsync();

        // 2 saniye beklet ve yönlendirme yap
        setTimeout(() => {
          if (hasCheckedToken) {
            const path = token ? "/home" : "/welcome";
            /* const path = "/home"; // Token kontrolü yapmadan direkt home sayfasına yönlendir */
            router.replace(path);
          }
        }, 700);
      } catch (error) {
        console.error("Splash Screen error:", error);
      }
    }

    prepareApp();
  }, [hasCheckedToken, token, fontsLoaded, isImageLoaded]); // isImageLoaded kontrolünü ekledik

  const isUserTheme = theme !== null;

  return (
    <SafeAreaView style={styles.container}>
      {isUserTheme ? (
        theme === "dark" ? (
          <Image
            source={require("@/assets/images/splash-dark.png")}
            style={styles.splashImage}
            onLoad={() => setIsImageLoaded(true)} // Görsel tamamen yüklenince state güncelle
          />
        ) : (
          <Image
            source={require("@/assets/images/splash-light.png")}
            style={styles.splashImage}
            onLoad={() => setIsImageLoaded(true)} // Görsel tamamen yüklenince state güncelle
          />
        )
      ) : useColorScheme() === "dark" ? (
        <Image
          source={require("@/assets/images/splash-dark.png")}
          style={styles.splashImage}
          onLoad={() => setIsImageLoaded(true)} // Görsel tamamen yüklenince state güncelle
        />
      ) : (
        <Image
          source={require("@/assets/images/splash-light.png")}
          style={styles.splashImage}
          onLoad={() => setIsImageLoaded(true)} // Görsel tamamen yüklenince state güncelle
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    splashImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
  });
