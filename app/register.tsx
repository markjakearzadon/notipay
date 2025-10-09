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

    // Form fields
    const [firstName, setFirstName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [lastName, setLastName] = useState("");
    const [department, setDepartment] = useState("");
    const [birthday, setBirthday] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        const trimmedFirst = firstName.trim();
        const trimmedMiddle = middleInitial.trim().toLowerCase();
        const trimmedLast = lastName.trim();
        const trimmedDept = department.trim();
        const trimmedBday = birthday.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phoneNumber.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirm = confirmPassword.trim();

        // === Validation ===
        if (!trimmedFirst || !trimmedLast || !trimmedDept) {
            Alert.alert("Error", "Please fill out your first name, last name, and department.");
            return;
        }
        if (!trimmedPassword || !trimmedConfirm) {
            Alert.alert("Error", "Please enter and confirm your password.");
            return;
        }
        if (trimmedPassword !== trimmedConfirm) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }
        if (trimmedPhone && !/^09\d{9}$/.test(trimmedPhone)) {
            Alert.alert("Error", "Please enter a valid Philippine cellphone number (e.g., 09123456789).");
            return;
        }
        if (trimmedBday && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedBday)) {
            Alert.alert("Error", "Birthday must be in YYYY-MM-DD format.");
            return;
        }

        try {
            setLoading(true);

            // Convert YYYY-MM-DD → ISO 8601
            const isoBirthday = trimmedBday ? new Date(trimmedBday).toISOString() : undefined;

            const res = await authApi.register({
                first_name: trimmedFirst,
                middle_initial: trimmedMiddle || undefined,
                last_name: trimmedLast,
                college_department: trimmedDept,
                birthday: isoBirthday,
                email: trimmedEmail || undefined,
                cellphone_number: trimmedPhone,
                password: trimmedPassword,
            });

            if (res?.user) {
                Alert.alert("Success", "User created successfully.");
                router.push("/login");
            } else {
                Alert.alert("Registration Failed", "Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", err.message || "Something went wrong during registration.");
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
                    <Text style={styles.subHeader}>Fill out the form below</Text>

                    {/* Name Fields */}
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        editable={!loading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Middle Initial"
                        value={middleInitial}
                        onChangeText={setMiddleInitial}
                        maxLength={1}
                        editable={!loading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        editable={!loading}
                    />

                    {/* Department */}
                    <TextInput
                        style={styles.input}
                        placeholder="College Department"
                        value={department}
                        onChangeText={setDepartment}
                        editable={!loading}
                    />

                    {/* Birthday */}
                    <TextInput
                        style={styles.input}
                        placeholder="Birthday (YYYY-MM-DD)"
                        value={birthday}
                        onChangeText={setBirthday}
                        editable={!loading}
                        keyboardType="numeric"
                    />

                    {/* Email */}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Cellphone */}
                    <TextInput
                        style={styles.input}
                        placeholder="Cellphone Number (e.g. 09123456789)"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        editable={!loading}
                        keyboardType="phone-pad"
                    />

                    {/* Password */}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={18}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!loading}
                    />

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Register;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "white" },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    imageContainer: { alignItems: "center", marginTop: 20 },
    title: { width: 180, height: 180, resizeMode: "contain" },
    formContainer: { padding: 16 },
    header: { fontSize: 20, fontWeight: "bold", color: "#111827" },
    subHeader: { fontSize: 13, color: "#6B7280", marginTop: 4, marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 6,
        padding: 12,
        fontSize: 14,
        color: "#1F2937",
        marginTop: 8,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 6,
        padding: 12,
        marginTop: 8,
    },
    passwordInput: { flex: 1, fontSize: 14, color: "#1F2937" },
    button: {
        padding: 14,
        borderRadius: 6,
        backgroundColor: "#3B82F6",
        marginTop: 20,
        alignItems: "center",
    },
    buttonDisabled: { backgroundColor: "#93C5FD" },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
    linkText: { textAlign: "center", fontSize: 13, color: "#6B7280", marginTop: 10 },
    link: { color: "#3B82F6" },
    linkDisabled: { opacity: 0.5 },
});
