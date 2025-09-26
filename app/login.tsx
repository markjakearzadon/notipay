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
import { authApi } from "../services/api"; // 

const UserLogin = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async () => {
        const trimmedUserName = userName.trim();
        const trimmedPassword = password.trim();

        if (!trimmedUserName || !trimmedPassword) {
            Alert.alert("Error", "Please enter username and password");
            return;
        }

        try {
            setLoading(true);
            const tokens = await authApi.login({ userName: trimmedUserName, password: trimmedPassword });

            if (tokens.role === "User") {
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

export default UserLogin;

const styles = StyleSheet.create({
    title: {
        width: 200,
        height: 200,
        justifyContent: "center",
    },
});
