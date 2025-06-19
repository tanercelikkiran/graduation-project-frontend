import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="question" />
      <Stack.Screen name="answer-evaluation" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
