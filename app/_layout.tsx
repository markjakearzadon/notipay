import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import { AuthProvider } from '../hooks/useAuth'; 
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import "../global.css";

export default function RootLayout() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  }, [navigation]);

  // ✅ Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        setIsAuthenticated(!!token);
      } catch (e) {
        console.error("Auth check failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const saveState = useCallback(
    debounce(async () => {
      try {
        const state = navigation.getState();
        await AsyncStorage.setItem("NAVIGATION_STATE", JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save navigation state:", e);
      }
    }, 500),
    [navigation]
  );

  useEffect(() => {
    navigation.addListener("state", saveState);
    return () => navigation.removeListener("state", saveState);
  }, [navigation, saveState]);

  // ✅ Loading screen while checking auth
  if (isLoading) {
    return (
      <>
        <View className="flex-1 justify-center items-center bg-white">
          <StatusBar barStyle="default" />
        </View>
      </>
    );
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screens - always accessible */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        
        {/* Protected routes - redirect to login if not authenticated */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            href: isAuthenticated ? null : '/login',
            headerShown: false 
          }}
        />
        
        {/* Admin routes */}
        <Stack.Screen
          name="admin"
          options={{ 
            href: isAuthenticated ? null : '/login',
            headerShown: false, 
            headerTitle: "Admin" 
          }}
        />
        <Stack.Screen
          name="admindashboard"
          options={{ 
            href: isAuthenticated ? null : '/login',
            headerShown: false, 
            headerTitle: "DashBoard" 
          }}
        />
        
        {/* Payment routes */}
        <Stack.Screen
          name="paymentlist"
          options={{ 
            href: isAuthenticated ? null : '/login',
            headerShown: true, 
            headerTitle: "Payment List" 
          }}
        />
        <Stack.Screen
          name="pay"
          options={{ 
            href: isAuthenticated ? null : '/login',
            headerShown: false 
          }}
        />
        
        {/* Other routes */}
        <Stack.Screen
          name="createannouncement"
          options={{ 
            href: isAuthenticated ? null : '/login',
            headerShown: true, 
            headerTitle: "Create Announcement" 
          }}
        />
        <Stack.Screen
          name="memberlist"
          options={{ 
            href: isAuthenticated ? null : '/login',
            headerShown: true, 
            headerTitle: "Member List" 
          }}
        />
        <Stack.Screen name="kambagelan" options={{ 
          href: isAuthenticated ? null : '/login',
          headerShown: false 
        }} />
      </Stack>
      <StatusBar barStyle={"default"} />
    </AuthProvider>
  );
}
