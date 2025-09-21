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
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useAuth } from '../hooks/useAuth'; 
import title from "../assets/images/title.png";

const API_URL = "http://192.168.254.132:5113/api"; 

const Login = () => {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Auth Hook
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!userName || !password) {
            Alert.alert("Error", "Please enter both username and password");
            return;
        }

        try {
            setLoading(true);

            //  Request payload (PascalCase for .NET model binding)
            const requestPayload = {
                UserName: userName.trim(),
                Password: password,
            };
            
            console.log('Login Request:', requestPayload);

            const response = await fetch(`${API_URL}/Auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            console.log('Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(' Error Response:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`HTTP ${response.status}: Server error`);
                }
                
                const errorMessage = errorData?.message || errorData?.error || "Invalid credentials";
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Success Response:', data);
            
            //  FIXED: Use camelCase to match JSON response
            const { accessToken, refreshToken } = data;
            
            if (accessToken && refreshToken) {
                console.log(' Storing tokens...');
                await SecureStore.setItemAsync("jwt", accessToken);
                await SecureStore.setItemAsync("refreshToken", refreshToken);

                console.log(' Calling auth login...');
                const success = await login(userName, accessToken);
                
                if (success) {
                    console.log(' Login successful, navigating...');
                    router.push("/(tabs)");
                } else {
                    throw new Error("Failed to initialize session in auth context");
                }
            } else {
                console.error(' Missing tokens - got:', Object.keys(data));
                throw new Error(`Invalid response format - missing tokens. Got: ${JSON.stringify(Object.keys(data))}`);
            }
        } catch (err: any) {
            console.error(' Login Error:', err);
            Alert.alert("Login Failed", err.message || "Something went wrong. Please try again.");
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
                            autoCapitalize="none"
                            editable={!loading}
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
                            editable={!loading}
                        />
                    </View>

                    {/* Login button */}
                    <TouchableOpacity
                        className={`p-4 rounded-lg mt-4 ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator size="small" color="white" className="mr-2" />
                                <Text className="text-white text-center font-medium">Logging in...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-medium">Continue</Text>
                        )}
                    </TouchableOpacity>

                    {/* Register link */}
                    <Text className="text-sm text-gray-500 text-center mt-2">
                        Don't have an account?{" "}
                        <Text 
                            className="text-blue-500" 
                            onPress={handleRegister}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        >
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
