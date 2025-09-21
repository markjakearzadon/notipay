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

const AdminLogin = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAdminLogin = async () => {
	if (!userName || !password) {
	    Alert.alert("Error", "Please enter both username and password");
	    return;
	}

	try {
	    setLoading(true);

	    const response = await fetch(`${API_URL}/Auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userName, password }),
	    });

	    if (!response.ok) throw new Error("Invalid credentials");

	    const data = await response.json();

	    if (data.accessToken && data.refreshToken && data.role) {
		await SecureStore.setItemAsync("jwt", data.accessToken);
		await SecureStore.setItemAsync("refreshToken", data.refreshToken);

		if (data.role === "Admin") {
		    router.push("/admindashboard");
		} else {
		    Alert.alert("Unauthorized", "You are not an admin");
		}
	    } else {
		throw new Error("Invalid response from server");
	    }
	} catch (err: any) {
	    Alert.alert("Login failed", err.message || "Something went wrong");
	} finally {
	    setLoading(false);
	}
    };

    return (
	<SafeAreaView className="flex-1 bg-white">
	    <ScrollView className="flex-1">
		<View className="items-center">
		    <Image source={title} style={styles.title} />
		</View>

		<View className="p-4 mt-20 w-full gap-3 justify-around">
		    <Text className="text-lg text-center font-bold">Admin Login</Text>

		    {/* Username input */}
		    <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
			<Text>Username:</Text>
			<TextInput
			    className="ml-2 flex-1"
			    placeholder="Enter username"
			    value={userName}
			    onChangeText={setUserName}
			    autoCapitalize="none"
			/>
		    </View>

		    {/* Password input */}
		    <View className="flex-row items-center border border-gray-300 rounded-lg p-4 mt-3">
			<Text>Password:</Text>
			<TextInput
			    className="ml-2 flex-1"
			    placeholder="Enter password"
			    value={password}
			    onChangeText={setPassword}
			    secureTextEntry
			/>
		    </View>

		    {/* Login button */}
		    <TouchableOpacity
			className="bg-blue-500 p-4 rounded-lg mt-4"
			onPress={handleAdminLogin}
			disabled={loading}
		    >
			<Text className="text-white text-center">
			    {loading ? "Logging in..." : "Continue"}
			</Text>
		    </TouchableOpacity>
		</View>
	    </ScrollView>
	</SafeAreaView>
    );
};

export default AdminLogin;

const styles = StyleSheet.create({
    title: {
	width: 200,
	height: 200,
	justifyContent: "center",
    },
});
