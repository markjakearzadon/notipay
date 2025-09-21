import { useState } from "react";
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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import title from "../assets/images/title.png";

const API_URL = "http://192.168.254.132:5113/api";

const Register = () => {
    const router = useRouter();
    const [userName, setUserName] = useState(""); // ✅ Changed from 'number'
    const [email, setEmail] = useState(""); // ✅ Added email field
    const [phoneNumber, setPhoneNumber] = useState(""); // ✅ Changed from 'fullname' to phoneNumber
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // ✅ Added for validation
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // ✅ Validation
        if (!userName || !email || !phoneNumber || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        // ✅ Phone number validation (Philippines format)
        const phoneRegex = /^9\d{9}$/; // Starts with 9, followed by 9 digits
        if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
            Alert.alert("Error", "Please enter a valid Philippine phone number (09XXXXXXXXX)");
            return;
        }

        // ✅ Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/Auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // ✅ Matches your API request format
                    userName: userName.trim(),
                    password: password,
                    email: email.trim().toLowerCase(),
                    phoneNumber: phoneNumber.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || "Registration failed";
                Alert.alert("Registration Failed", errorMessage);
                return;
            }

            const data = await response.json();
            
            // ✅ Handle successful registration response
            // Assuming your API returns tokens or success message
            if (data.accessToken) {
                // Auto-login after successful registration
                await SecureStore.setItemAsync("jwt", data.accessToken);
                if (data.refreshToken) {
                    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
                }
                
                Alert.alert(
                    "Registration Successful!",
                    "Welcome! You are now registered and logged in.",
                    [
                        {
                            text: "Continue",
                            onPress: () => {
                                router.push("/(tabs)");
                            },
                        },
                    ]
                );
            } else {
                Alert.alert(
                    "Registration Successful!",
                    "Please check your email to verify your account.",
                    [
                        {
                            text: "Login",
                            onPress: () => {
                                router.push("/login");
                            },
                        },
                    ]
                );
            }

        } catch (err: any) {
            console.error('Registration error:', err);
            Alert.alert(
                "Registration Error", 
                err.message || "Network error. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <SafeAreaView className="h-full w-screen bg-white">
            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Logo */}
                <View className="items-center mt-8">
                    <Image source={title} style={styles.title} />
                </View>

                {/* Form Container */}
                <View className="p-4 mt-8 w-full gap-4">
                    {/* Title */}
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-center text-gray-800">Create Account</Text>
                        <Text className="text-sm text-gray-500 text-center mt-2">
                            Join NotiPay and start receiving payments easily
                        </Text>
                    </View>

                    {/* Username Input */}
                    <View className="border border-gray-300 rounded-lg p-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Username</Text>
                        <TextInput
                            className="flex-1"
                            placeholder="Enter your username"
                            value={userName}
                            onChangeText={setUserName}
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    {/* Email Input */}
                    <View className="border border-gray-300 rounded-lg p-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                        <TextInput
                            className="flex-1"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    {/* Phone Number Input */}
                    <View className="border border-gray-300 rounded-lg p-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                        <View className="flex-row items-center">
                            <View className="bg-gray-100 px-3 py-2 rounded-l-lg">
                                <Text className="text-sm font-medium text-gray-700">+63</Text>
                            </View>
                            <TextInput
                                className="flex-1 border-l-0 px-4 py-2 rounded-r-lg"
                                placeholder="9123456789"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View className="border border-gray-300 rounded-lg p-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                        <TextInput
                            className="flex-1"
                            placeholder="Enter your password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                    </View>

                    {/* Confirm Password Input */}
                    <View className="border border-gray-300 rounded-lg p-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
                        <TextInput
                            className="flex-1"
                            placeholder="Confirm your password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            editable={!loading}
                        />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        className={`p-4 rounded-lg mt-2 ${
                            loading || (!userName || !email || !phoneNumber || !password || !confirmPassword)
                                ? 'bg-gray-400' 
                                : 'bg-blue-500'
                        }`}
                        onPress={handleRegister}
                        disabled={loading || !userName || !email || !phoneNumber || !password || !confirmPassword}
                        activeOpacity={0.9}
                    >
                        {loading ? (
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator size="small" color="white" className="mr-2" />
                                <Text className="text-white text-center font-medium">Creating Account...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold text-lg">Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View className="items-center mt-6">
                        <Text className="text-sm text-gray-500 text-center">
                            Already have an account?{" "}
                            <Text 
                                className="text-blue-500 font-medium"
                                onPress={handleLogin}
                            >
                                Login here
                            </Text>
                        </Text>
                    </View>

                    {/* Terms and Privacy */}
                    <View className="mt-6 px-2">
                        <Text className="text-xs text-gray-500 text-center leading-5">
                            By creating an account, you agree to our{" "}
                            <Text 
                                className="text-blue-500 underline"
                                onPress={() => router.push("/kambagelan")}
                            >
                                Terms of Service
                            </Text>{" "}
                            and{" "}
                            <Text 
                                className="text-blue-500 underline"
                                onPress={() => router.push("/kambagelan")}
                            >
                                Privacy Policy
                            </Text>
                            .
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Register;

const styles = StyleSheet.create({
    title: {
        width: 200,
        height: 200,
        justifyContent: "center",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
});