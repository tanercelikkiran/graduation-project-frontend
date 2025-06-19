import { PyramidProvider } from "@/contexts/PyramidListContext";
import { PyramidStatsProvider } from "@/contexts/PyramidStatsContext";
import { XPProvider } from "@/contexts/XPContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <XPProvider>
      <PyramidProvider>
        <PyramidStatsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="pyramid" />
          </Stack>
        </PyramidStatsProvider>
      </PyramidProvider>
    </XPProvider>
  );
}
