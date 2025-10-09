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

    const [lastname, setLastname] = useState("");
    const [firstname, setFirstname] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [collegeDept, setCollegeDept] = useState("");
    const [birthday, setBirthday] = useState("");
    const [email, setEmail] = useState("");
    const [cellphoneNumber, setCellphoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        const trimmedLastname = lastname.trim();
        const trimmedFirstname = firstname.trim();
        const trimmedMiddleInitial = middleInitial.trim();
        const trimmedCollegeDept = collegeDept.trim();
        const trimmedBirthday = birthday.trim();
        const trimmedEmail = email.trim();
        const trimmedCellphone = cellphoneNumber.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedLastname || !trimmedFirstname || !trimmedCollegeDept || !trimmedPassword || !trimmedEmail || !trimmedCellphone) {
            Alert.alert("Error", "Please fill out all required fields.");
            return;
        }

        if (trimmedPassword !== trimmedConfirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        if (!/^09\d{9}$/.test(trimmedCellphone)) {
            Alert.alert("Error", "Please enter a valid 11-digit Philippine cellphone number (e.g., 09123456789).");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                first_name: trimmedFirstname,
                middle_initial: trimmedMiddleInitial,
                last_name: trimmedLastname,
                college_department: trimmedCollegeDept,
                birthday: trimmedBirthday ? `${trimmedBirthday}T00:00:00Z` : undefined,
                email: trimmedEmail,
                cellphone_number: trimmedCellphone,
                password: trimmedPassword,
            };

            const res = await authApi.register(payload);

            if (res && res.user) {
                Alert.alert("Success", "Registration successful!");
                router.push("/login");
            } else {
                Alert.alert("Registration Failed", "Unexpected server response.");
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
                    <Text style={styles.subHeader}>Enter your details to create an account</Text>

                    {/* Last Name */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Last Name"
                            value={lastname}
                            onChangeText={setLastname}
                            autoCapitalize="words"
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* First Name */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="First Name"
                            value={firstname}
                            onChangeText={setFirstname}
                            autoCapitalize="words"
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Middle Initial */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Middle Initial (optional)"
                            value={middleInitial}
                            onChangeText={setMiddleInitial}
                            autoCapitalize="characters"
                            maxLength={1}
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* College Department */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="College Department"
                            value={collegeDept}
                            onChangeText={setCollegeDept}
                            autoCapitalize="words"
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Birthday */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Birthday (YYYY-MM-DD) (optional)"
                            value={birthday}
                            onChangeText={setBirthday}
                            keyboardType="numeric"
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Email */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
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

                    {/* Cellphone Number */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Cellphone Number (e.g. 09123456789)"
                            keyboardType="phone-pad"
                            value={cellphoneNumber}
                            onChangeText={setCellphoneNumber}
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Password */}
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
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="gray" />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Confirm Password"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={18} color="gray" />
                        </TouchableOpacity>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator size="small" color="white" style={styles.activityIndicator} />
                                <Text style={styles.buttonText}>Registering...</Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
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
    safeArea: { flex: 1, backgroundColor: "white" },
    scrollView: { flex: 1 },
    scrollContent: { minHeight: "100%", paddingBottom: 20 },
    imageContainer: { alignItems: "center" },
    title: { width: 200, height: 200, justifyContent: "center" },
    formContainer: { padding: 12, marginTop: 60, width: "100%", gap: 8 },
    header: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
    subHeader: { fontSize: 12, color: "#6B7280" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 6,
        padding: 12,
    },
    marginTop: { marginTop: 8 },
    textInput: { flex: 1, color: "#1F2937", fontSize: 14 },
    button: {
        padding: 12,
        borderRadius: 6,
        backgroundColor: "#3B82F6",
        marginTop: 12,
    },
    buttonDisabled: { backgroundColor: "#60A5FA" },
    buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    activityIndicator: { marginRight: 6 },
    buttonText: { color: "white", textAlign: "center", fontWeight: "500", fontSize: 14 },
    linkText: { fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 6 },
    link: { color: "#3B82F6" },
    linkDisabled: { opacity: 0.5 },
});
