import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
    ActivityIndicator,
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
import { authApi } from "../services/api";

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

	    const response = await authApi.login({
		email: trimmedEmail,
		password: trimmedPassword,
	    });

	    await SecureStore.setItemAsync("userId", response.user.id);

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
	<SafeAreaView style={styles.safeArea}>
	    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
		<View style={styles.imageContainer}>
		    <Image
			source={require("../assets/images/title.png")}
			style={styles.title}
		    />
		</View>

		<View style={styles.formContainer}>
		    <Text style={styles.header}>Login</Text>
		    <Text style={styles.subHeader}>
			Enter your email and password to continue
		    </Text>

		    {/* Email input */}
		    <View style={styles.inputContainer}>
			<TextInput
			    style={styles.textInput}
			    placeholder="Email"
			    value={email}
			    onChangeText={setEmail}
			    autoCapitalize="none"
			    keyboardType="email-address"
			    editable={!loading}
			    placeholderTextColor="#999"
			/>
		    </View>

		    {/* Password input */}
		    <View style={[styles.inputContainer, styles.marginTop]}>
			<TextInput
			    style={styles.textInput}
			    placeholder="Password"
			    secureTextEntry={!showPassword}
			    value={password}
			    onChangeText={setPassword}
			    editable={!loading}
			    placeholderTextColor="#999"
			/>
			<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
			    <Ionicons
				name={showPassword ? "eye-off" : "eye"}
				size={20}
				color="gray"
			    />
			</TouchableOpacity>
		    </View>

		    {/* Login button */}
		    <TouchableOpacity
			style={[styles.button, loading && styles.buttonDisabled]}
			onPress={handleLogin}
			disabled={loading}
			activeOpacity={0.7}
		    >
			{loading ? (
			    <View style={styles.buttonContent}>
				<ActivityIndicator
				    size="small"
				    color="white"
				    style={styles.activityIndicator}
				/>
				<Text style={styles.buttonText}>Logging in...</Text>
			    </View>
			) : (
			    <Text style={styles.buttonText}>Continue</Text>
			)}
		    </TouchableOpacity>

		    {/* Register link */}
		    <Text style={styles.registerText}>
			Don't have an account?{" "}
			<Text
			    style={[styles.registerLink, loading && styles.linkDisabled]}
			    onPress={handleRegister}
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
    safeArea: {
	flex: 1,
	backgroundColor: "white",
    },
    scrollView: {
	flex: 1,
    },
    imageContainer: {
	alignItems: "center",
    },
    title: {
	width: 200,
	height: 200,
	justifyContent: "center",
    },
    formContainer: {
	padding: 16,
	marginTop: 80,
	width: "100%",
	gap: 12,
	justifyContent: "space-around",
    },
    header: {
	fontSize: 18,
	fontWeight: "bold",
	color: "#1F2937", // Dark-500 equivalent
    },
    subHeader: {
	fontSize: 14,
	color: "#6B7280", // Gray-500 equivalent
    },
    inputContainer: {
	flexDirection: "row",
	alignItems: "center",
	borderWidth: 1,
	borderColor: "#D1D5DB", // Gray-300 equivalent
	borderRadius: 8,
	padding: 16,
    },
    marginTop: {
	marginTop: 12,
    },
    textInput: {
	flex: 1,
	color: "#1F2937", // Dark-500 equivalent
	fontSize: 16,
    },
    button: {
	padding: 16,
	borderRadius: 8,
	backgroundColor: "#3B82F6", // Blue-500 equivalent
	marginTop: 16,
    },
    buttonDisabled: {
	backgroundColor: "#60A5FA", // Blue-400 equivalent
    },
    buttonContent: {
	flexDirection: "row",
	alignItems: "center",
	justifyContent: "center",
    },
    activityIndicator: {
	marginRight: 8,
    },
    buttonText: {
	color: "white",
	textAlign: "center",
	fontWeight: "500",
	fontSize: 16,
    },
    registerText: {
	fontSize: 14,
	color: "#6B7280", // Gray-500 equivalent
	textAlign: "center",
	marginTop: 8,
    },
    registerLink: {
	color: "#3B82F6", // Blue-500 equivalent
    },
    linkDisabled: {
	opacity: 0.5,
    },
});
