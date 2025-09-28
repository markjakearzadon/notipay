import { Ionicons } from "@expo/vector-icons";
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
import { authApi } from "../services/api";
import * as SecureStore from "expo-secure-store";

const UserLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const router = useRouter();

    const handleLogin = async () => {
	const trimmedEmail = email.trim();
	const trimmedPassword = password.trim();

	if (!trimmedEmail || !trimmedPassword) {
            Alert.alert("Error", "Please enter email and password");
            return;
	}

	try {
            setLoading(true);
            const response = await authApi.login({ email: trimmedEmail, password: trimmedPassword });

            // Save userId to SecureStore
            await SecureStore.setItemAsync('userId', response.user.id);

            // Check user role
            if (response.user.role.toLowerCase() === "user") {
		router.push("/(tabs)");
            } else {
		Alert.alert("Access Denied", "You do not have admin privileges");
            }
	} catch (err: any) {
            Alert.alert("Login Failed", err.message || "Something went wrong");
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
                    <Image source={require("../assets/images/title.png")} style={styles.title} />
                </View>

                <View className="p-4 mt-20 w-full gap-3 justify-around">
                    <Text className="text-lg font-bold">Login</Text>
                    <Text className="text-sm text-gray-500">
                        Enter your email and password to continue
                    </Text>

                    {/* Email input */}
                    <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
                        <TextInput
                            className="flex-1"
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />
                    </View>

                    {/* Password input */}
                    <View className="flex-row items-center border border-gray-300 rounded-lg p-4 mt-3">
                        <TextInput
                            className="flex-1"
                            placeholder="Password"
                            secureTextEntry={!showPassword} 
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
			<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"} // 👀 switch icons
                                size={20}
                                color="gray"
                            />
                        </TouchableOpacity>
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

export default UserLogin;

const styles = StyleSheet.create({
    title: {
        width: 200,
        height: 200,
        justifyContent: "center",
    },
});
