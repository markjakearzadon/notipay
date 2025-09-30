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
import axios from "axios";

const Register = () => {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        const trimmedUserName = userName.trim();
        const trimmedPassword = password.trim();
        const trimmedEmail = email.trim();
        const trimmedPhoneNumber = phoneNumber.trim();
        const trimmedAppointmentDate = appointmentDate.trim();

        // Input validation
        if (!trimmedUserName || !trimmedPassword) {
            Alert.alert("Error", "Please enter username and password");
            return;
        }
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }
        if (trimmedPhoneNumber && !/^\d{10}$/.test(trimmedPhoneNumber)) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }
        if (!trimmedAppointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(trimmedAppointmentDate)) {
            Alert.alert("Error", "Please enter a valid appointment date (YYYY-MM-DD)");
            return;
        }
        var d;

        try {
            setLoading(true);
            // Validate date format
            const dateObj = new Date(trimmedAppointmentDate);
            if (isNaN(dateObj.getTime())) {
                Alert.alert("Error", "Invalid date format. Please use YYYY-MM-DD");
                return;
            }

            // Send date to backend
            const response = await axios.get("https://notipaygobackend.onrender.com/api/date");
            console.log("API Date Response:", response.data);

            const inputDate = new Date(response.data.date);
            const oneYearBefore = new Date(inputDate);
            oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);
            d = response.data.date;

            if (dateObj <= oneYearBefore) {
                // Eligible, continue registration
                const registerRes = await authApi.register({
                    fullname: trimmedUserName,
                    password: trimmedPassword,
                    email: trimmedEmail || undefined,
                    gcash_number: trimmedPhoneNumber ? `0${trimmedPhoneNumber}` : undefined,
                    role: "user",
                    appointment_date: trimmedAppointmentDate,
                });

                if (registerRes && registerRes.id) {
                    Alert.alert("Success", "Registration successful. Please log in.");
                    router.push("/login");
                } else {
                    Alert.alert("Registration Failed", "Unable to register. Please try again.");
                }
            } else {
                Alert.alert("Not Eligible", `You must be an employee for at least 1 year to register. ${d}`);
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.imageContainer}>
                    <Image source={require("../assets/images/title.png")} style={styles.title} />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.header}>Register</Text>
                    <Text style={styles.subHeader}>
                        Enter your details to create an account
                    </Text>

                    {/* Username input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Username"
                            value={userName}
                            onChangeText={setUserName}
                            autoCapitalize="none"
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
                                size={18}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Email input */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Email (optional)"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Phone number input */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <Text style={styles.phonePrefix}>+63</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Phone Number (optional)"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <Text style={styles.subHeader} className="mt-4">
			When did you start your appointment?
                    </Text>
                    {/* Appointment date input */}
                    <View style={[styles.inputContainer, styles.marginTop, styles.appointmentInputContainer]}> 
			<TextInput
                            style={styles.appointmentTextInput}
                            placeholder="(YYYY-MM-DD)"
                            value={appointmentDate}
                            onChangeText={setAppointmentDate}
                            editable={!loading}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Register button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
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
                                <Text style={styles.buttonText}>Registering...</Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login link */}
                    <Text style={styles.linkText}>
                        Already have an account?{" "}
                        <Text
                            style={[styles.link, loading && styles.linkDisabled]}
                            onPress={() => router.push("/login")}
                        >
                            Login here
                        </Text>
                    </Text>

                    {/* Terms and Policy */}
                    <Text style={styles.linkText}>
                        Sa pagpapatuloy, sumasang-ayon ka sa aming{" "}
                        <Text
                            style={[styles.link, loading && styles.linkDisabled]}
                            onPress={() => router.push("/kambagelan")}
                        >
                            Tuntunin ng Serbisyo
                        </Text>{" "}
                        at{" "}
                        <Text
                            style={[styles.link, loading && styles.linkDisabled]}
                            onPress={() => router.push("/kambagelan")}
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
    safeArea: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        minHeight: "100%", // Ensure ScrollView can scroll on smaller screens
        paddingBottom: 20, // Add padding to avoid content being cut off
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
        padding: 12,
        marginTop: 60,
        width: "100%",
        gap: 8,
        justifyContent: "space-around",
    },
    header: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1F2937", // Dark-500 equivalent
    },
    subHeader: {
        fontSize: 12,
        color: "#6B7280", // Gray-500 equivalent
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB", // Gray-300 equivalent
        borderRadius: 6,
        padding: 12,
    },
    appointmentInputContainer: {
        padding: 14, // Slightly larger for appointment input
        minHeight: 48, // Ensure enough height for placeholder
    },
    marginTop: {
        marginTop: 8,
    },
    textInput: {
        flex: 1,
        color: "#1F2937", // Dark-500 equivalent
        fontSize: 14,
    },
    appointmentTextInput: {
        flex: 1,
        color: "#1F2937", // Dark-500 equivalent
        fontSize: 16, // Larger for appointment input
    },
    phonePrefix: {
        marginRight: 6,
        color: "#1F2937", // Dark-500 equivalent
        fontSize: 14,
    },
    button: {
        padding: 12,
        borderRadius: 6,
        backgroundColor: "#3B82F6", // Blue-500 equivalent
        marginTop: 12,
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
        marginRight: 6,
    },
    buttonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "500",
        fontSize: 14,
    },
    linkText: {
        fontSize: 12,
        color: "#6B7280", // Gray-500 equivalent
        textAlign: "center",
        marginTop: 6,
    },
    link: {
        color: "#3B82F6", // Blue-500 equivalent
    },
    linkDisabled: {
        opacity: 0.5,
    },
});
