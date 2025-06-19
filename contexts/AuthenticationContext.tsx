import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";
import axios from "axios";

interface TokenValidation {
  exp: number;
}

interface AuthContextType {
  token: string | null;
  hasCheckedToken: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  setUserSession: (accessToken: string, refreshToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    null
  );
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateToken = (token: string): boolean => {
    try {
      const decoded: TokenValidation = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Token decode error:", error);
      return false;
    }
  };

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    setToken(accessToken);
    setRefreshTokenValue(refreshToken);
  };

  useEffect(() => {
    const loadToken = async () => {
      setIsLoading(true);
      try {
        const storedToken = await SecureStore.getItemAsync("accessToken");
        const storedRefreshToken = await SecureStore.getItemAsync(
          "refreshToken"
        );

        if (storedToken) {
          const isValid = validateToken(storedToken);
          if (isValid) {
            setToken(storedToken);
            setRefreshTokenValue(storedRefreshToken);
          } else if (storedRefreshToken) {
            const refreshed = await refreshToken();
            if (!refreshed) {
              await logout();
            }
          } else {
            await logout();
          }
        } else if (storedRefreshToken) {
          setRefreshTokenValue(storedRefreshToken);
          const refreshed = await refreshToken();
          if (!refreshed) {
            await logout();
          }
        }
      } catch (error) {
        console.error("Error loading token:", error);
        await logout();
      } finally {
        setHasCheckedToken(true);
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      console.log(`Attempting login to ${apiUrl}/login with email: ${email}`);

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(
        `${apiUrl}/login`,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(`Login response status: ${response.status}`);

      const data = response.data;
      if (!data) {
        console.error("No data returned from login request");
        throw new Error("No data returned from login request");
      }

      if (!data.access_token) {
        console.error("Access token not provided in response", data);
        throw new Error("Access token not provided in response");
      }

      await saveTokens(data.access_token, data.refresh_token);
      return data;
    } catch (error: any) {
      console.error(
        "Login error details:",
        error.response?.data || error.message
      );
      console.error("Login error status:", error.response?.status);
      console.error("Login error headers:", error.response?.headers);
      throw error;
    } finally {
      setIsLoading(false);
      setHasCheckedToken(true);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        try {
          const apiUrl = process.env.EXPO_PUBLIC_API_URL;
          await axios.post(
            `${apiUrl}/user/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          router.dismissAll();
          router.replace({ pathname: "/login" });
        } catch (e) {
          console.error("Error calling logout endpoint:", e);
        }
      }
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setRefreshTokenValue(null);
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!refreshTokenValue) {
        return false;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.post(
        `${apiUrl}/user/refresh-token`,
        { refresh_token: refreshTokenValue },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Token refresh failed");
      }

      const data = response.data;
      await saveTokens(data.access_token, data.refresh_token);
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      await logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setUserSession = async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        hasCheckedToken,
        isLoading,
        login,
        logout,
        refreshToken,
        setUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
