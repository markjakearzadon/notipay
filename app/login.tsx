import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import title from "../assets/images/title.png";

const login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password"); // Use Alert.alert for native feel
      return;
    }

    setLoading(true);
    try {
      // Update IP if needed (run ipconfig/ifconfig to confirm)
      const response = await fetch("http://192.168.1.100:42069/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! Status: ${response.status}`
        );
      }

      if (data.success && data.token) {
        // Store JWT token in AsyncStorage
        await AsyncStorage.setItem("authToken", data.token);
        router.push("/(tabs)");
      } else {
        Alert.alert("Error", "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.message); // Log specific message
      Alert.alert(
        "Error",
        error.message || "Network error. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <SafeAreaView className="h-full w-screen bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center">
          <Image source={title} style={styles.title} />
        </View>
        <View className="p-4 mt-20 w-full gap-3 justify-around">
          <Text className="text-lg font-bold">Login</Text>
          <Text className="text-sm text-gray-500">
            Enter your phone number to continue
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
            <TextInput
              className="ml-2 flex-1"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
            <TextInput
              className="ml-2 flex-1"
              placeholder="Enter your password"
              keyboardType="default"
              secureTextEntry // Add this for password masking
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg mt-4"
            onPress={() => handleLogin()}
            disabled={loading}
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            <Text className="text-white text-center">
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
          <Text className="text-sm text-gray-500 text-center mt-2">
            Don't have an account?{" "}
            <Text className="text-blue-500" onPress={() => handleRegister()}>
              Register here
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default login;
const styles = StyleSheet.create({
  title: {
    width: 200,
    height: 200,
    justifyContent: "center",
  },
});
