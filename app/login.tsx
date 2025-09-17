import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import title from "../assets/images/title.png";

const API_URL = "http://192.168.254.132:5113/api";

const Login = () => {
  const router = useRouter();
  const [userName, setUserName] = useState(""); // ✅ renamed from number
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userName || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: userName, // ✅ now matches state name
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
	// Expected response: { jwt: "xxx", refreshToken: "yyy" }

	if (data.accessToken && data.refreshToken) {
	    await SecureStore.setItemAsync("jwt", data.accessToken); 
	    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
	  
          router.push("/(tabs)");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Something went wrong");
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
            Enter your username and password to continue
          </Text>

          {/* Username input */}
          <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
            <TextInput
              className="flex-1"
              placeholder="Username"
              value={userName}
              onChangeText={setUserName}
            />
          </View>

          {/* Password input */}
          <View className="flex-row items-center border border-gray-300 rounded-lg p-4 mt-3">
            <TextInput
              className="flex-1"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Login button */}
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg mt-4"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center">
              {loading ? "Logging in..." : "Continue"}
            </Text>
          </TouchableOpacity>

          {/* Register link */}
          <Text className="text-sm text-gray-500 text-center mt-2">
            Don’t have an account?{" "}
            <Text className="text-blue-500" onPress={handleRegister}>
              Register here
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  title: {
      width: 200,
      height: 200,
      justifyContent: "center",
  },
});
