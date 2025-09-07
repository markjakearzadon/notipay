import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import { debounce } from "lodash";
import { useCallback, useEffect } from "react";
import { StatusBar } from "react-native";
import "../global.css";
export default function RootLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedState = await AsyncStorage.getItem("NAVIGATION_STATE");
        if (savedState) {
          navigation.reset(JSON.parse(savedState));
        }
      } catch (e) {
        console.error("Failed to restore navigation state:", e);
      }
    };

    restoreState();
  }, [navigation]); // Add navigation to dependencies

  const saveState = useCallback(
    debounce(async () => {
      try {
        const state = navigation.getState();
        await AsyncStorage.setItem("NAVIGATION_STATE", JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save navigation state:", e);
      }
    }, 500), // Debounce for 500ms
    [navigation]
  );

  useEffect(() => {
    navigation.addListener("state", saveState);
    return () => navigation.removeListener("state", saveState);
  }, [navigation, saveState]);
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="kambagelan" options={{ headerShown: false }} />
        <Stack.Screen
          name="admin"
          options={{ headerShown: false, headerTitle: "Admin" }}
        />
        <Stack.Screen
          name="admindashboard"
          options={{ headerShown: false, headerTitle: "DashBoard" }}
        />
        <Stack.Screen
          name="paymentlist"
          options={{ headerShown: true, headerTitle: "Payment List" }}
        />
        <Stack.Screen
          name="createannouncement"
          options={{ headerShown: true, headerTitle: "Create Announcement" }}
        />
        <Stack.Screen
          name="memberlist"
          options={{ headerShown: true, headerTitle: "Member List" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar barStyle={"default"} />
    </>
  );
}
