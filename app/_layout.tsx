import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="kambagelan" options={{ headerShown: false }} />
        <Stack.Screen
          name="admin"
          options={{ headerShown: true, headerTitle: "Admin" }}
        />
        <Stack.Screen
          name="admindashboard"
          options={{ headerShown: true, headerTitle: "DashBoard" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar barStyle={"default"} />
    </>
  );
}
