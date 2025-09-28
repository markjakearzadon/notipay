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
import title from "../assets/images/title.png";

const AdminLogin = () => {
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

            // Check role
            if (response.user.role.toLowerCase() === "admin") {
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
        <SafeAreaView className="h-full w-screen bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="items-center">
                    <Image source={title} style={styles.title} />
                </View>

                <View className="p-4 mt-20 w-full gap-3 justify-around">
                    <Text className="text-lg font-bold text-center">Admin Login</Text>

                    {/* Email */}
                    <View className="flex-row items-center border border-gray-300 rounded-lg p-4 mt-3">
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

                    {/* Password */}
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

                    {/* Login Button */}
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
