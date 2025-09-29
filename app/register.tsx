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

const Register = () => {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        const trimmedUserName = userName.trim();
        const trimmedPassword = password.trim();
        const trimmedEmail = email.trim();
        const trimmedPhoneNumber = phoneNumber.trim();

        if (!trimmedUserName || !trimmedPassword) {
            Alert.alert("Error", "Please enter username and password");
            return;
        }

        // Validate email format if provided
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        // Validate phone number format if provided (e.g., 10 digits for +63)
        if (trimmedPhoneNumber && !/^\d{10}$/.test(trimmedPhoneNumber)) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }

        try {
            setLoading(true);
            const response = await authApi.register({
		fullname: trimmedUserName, // backend expects fullname, not userName
		password: trimmedPassword,
		email: trimmedEmail || undefined,
		gcash_number: trimmedPhoneNumber ? `0${trimmedPhoneNumber}` : undefined, 
		role: "user",
            });

            if (response && response.id) {
                Alert.alert("Success", "Registration successful. Please log in.");
                router.push("/login");
            } else {
		Alert.alert("Registration Failed", "Unable to register. Please try again.");
            }
        } catch (err: any) {
            Alert.alert("Registration Failed", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="h-full w-screen bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="items-center">
                    <Image source={require("../assets/images/title.png")} style={styles.title} />
                </View>

                <View className="p-4 mt-20 w-full gap-3 justify-around">
                    <Text className="text-lg font-bold">Register</Text>
                    <Text className="text-sm text-gray-500">
                        Enter your details to create an account
                    </Text>

                    {/* Username input */}
                    <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
                        <TextInput
                            className="flex-1 text-dark-500"
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
                            className="flex-1 text-dark-500"
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

                    {/* Email input */}
                    <View className="flex-row items-center border border-gray-300 rounded-lg p-4 mt-3">
                        <TextInput
                            className="flex-1 text-dark-500"
                            placeholder="Email (optional)"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />
                    </View>

                    {/* Phone number input */}
                    <View className="flex-row items-center border border-gray-300 rounded-lg p-4 mt-3">
                        <Text className="mr-2">+63</Text>
                        <TextInput
                            className="flex-1 text-dark-500"
                            placeholder="Phone Number (optional)"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            editable={!loading}
                        />
                    </View>

                    {/* Register button */}
                    <TouchableOpacity
                        className={`p-4 rounded-lg mt-4 ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator size="small" color="white" className="mr-2" />
                                <Text className="text-white text-center font-medium">Registering...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-medium">Continue</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login link */}
                    <Text className="text-sm text-gray-500 text-center mt-2">
                        Already have an account?{" "}
                        <Text
                            className="text-blue-500"
                            onPress={() => router.push("/login")}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        >
                            Login here
                        </Text>
                    </Text>

                    {/* Terms and Policy */}
                    <Text className="text-sm text-gray-500 text-center mt-4">
                        Sa pagpapatuloy, sumasang-ayon ka sa aming{" "}
                        <Text
                            className="text-blue-500"
                            onPress={() => router.push("/kambagelan")}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        >
                            Tuntunin ng Serbisyo
                        </Text>{" "}
                        at{" "}
                        <Text
                            className="text-blue-500"
                            onPress={() => router.push("/kambagelan")}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        >
                            Patakaran sa Privacy.
                        </Text>
                    </Text>
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
});
