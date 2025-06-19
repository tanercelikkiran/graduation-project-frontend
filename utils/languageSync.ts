import axios from "axios";

export const syncUserLanguageWithFrontend = async (
  token: string,
  setInterfaceLanguage: (language: string) => void
) => {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const response = await axios.get(`${apiUrl}/user/get/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.status === 200) {
      const userData = response.data;
      const userSystemLanguage = userData.system_language;
      
      // Sync frontend language with user's preference
      if (userSystemLanguage && userSystemLanguage !== "") {
        setInterfaceLanguage(userSystemLanguage);
        console.log(`Synced user language: ${userSystemLanguage}`);
      }
    }
  } catch (error) {
    console.error("Error syncing user language:", error);
    // Don't throw error as this is a non-critical operation
  }
};