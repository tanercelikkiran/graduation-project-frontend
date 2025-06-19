import { LeaderboardProvider } from "@/contexts/LeaderboardContext";
import { SuggestedModuleProvider } from "@/contexts/SuggestedModuleContext";
import { UserProgressProvider } from "@/contexts/UserProgressContext";
import { WeeklyProgressProvider } from "@/contexts/WeeklyProgressContext";
import { XPProvider } from "@/contexts/XPContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <WeeklyProgressProvider>
      <XPProvider>
        <UserProgressProvider>
          <LeaderboardProvider>
            <SuggestedModuleProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
              </Stack>
            </SuggestedModuleProvider>
          </LeaderboardProvider>
        </UserProgressProvider>
      </XPProvider>
    </WeeklyProgressProvider>
  );
}
