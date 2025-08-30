import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="kambagelan" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
