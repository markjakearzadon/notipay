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
import title from "../assets/images/title.png";
import { authApi } from "../services/api"; 

const AdminLogin = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async () => {
        // Trim both leading and trailing whitespace from inputs
        const trimmedUserName = userName.trim();
        const trimmedPassword = password.trim();

        if (!trimmedUserName || !trimmedPassword) {
            Alert.alert("Error", "Please enter username and password");
            return;
        }

        try {
            setLoading(true);
            const tokens = await authApi.login({ userName: trimmedUserName, password: trimmedPassword });

            if (tokens.role === "Admin") {
                router.push("/admindashboard");
            } else {
                Alert.alert("Access Denied", "You do not have admin privileges");
            }
        } catch (err: any) {
            Alert.alert("Login Failed", err.message || "Something went wrong");
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

		    {/* Username */}
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

		    {/* Password */}
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

		    {/* Login Button */}
		    <TouchableOpacity
			className="bg-blue-500 p-4 rounded-lg mt-4"
				   onPress={handleLogin}
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
