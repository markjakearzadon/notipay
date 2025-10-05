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

    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [department, setDepartment] = useState("");
    const [birthday, setBirthday] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        const trimmedLast = lastName.trim();
        const trimmedFirst = firstName.trim();
        const trimmedMiddle = middleInitial.trim().toUpperCase();
        const trimmedDept = department.trim();
        const trimmedBday = birthday.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phoneNumber.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirm = confirmPassword.trim();
        const trimmedAppointment = appointmentDate.trim();

        const fullName = `${trimmedLast}, ${trimmedFirst}${trimmedMiddle ? " " + trimmedMiddle + "." : ""}`;

        if (!trimmedLast || !trimmedFirst || !trimmedDept) {
            Alert.alert("Error", "Please fill out your full name and department.");
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
        if (trimmedPhone && !/^\d{10}$/.test(trimmedPhone)) {
            Alert.alert("Error", "Please enter a valid 10-digit cellphone number.");
            return;
        }
        if (trimmedBday && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedBday)) {
            Alert.alert("Error", "Birthday must be in YYYY-MM-DD format.");
            return;
        }
        if (!trimmedAppointment || !/^\d{4}-\d{2}-\d{2}$/.test(trimmedAppointment)) {
            Alert.alert("Error", "Appointment date must be in YYYY-MM-DD format.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get("https://notipaygobackend.onrender.com/api/date");
            console.log("API Date Response:", response.data);

            const apiDate = new Date(response.data.date);
            const oneYearLater = new Date(apiDate);
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

            if (new Date() >= oneYearLater) {
                const registerRes = await authApi.register({
                    fullname: fullName,
                    department: trimmedDept,
                    birthday: trimmedBday || undefined,
                    email: trimmedEmail || undefined,
                    gcash_number: trimmedPhone ? `0${trimmedPhone}` : undefined,
                    password: trimmedPassword,
                    appointment_date: trimmedAppointment,
                    role: "user",
                });

                if (registerRes && registerRes.id) {
                    Alert.alert("Success", "Registration successful. Please log in.");
                    router.push("/login");
                } else {
                    Alert.alert("Registration Failed", "Unable to register. Please try again.");
                }
            } else {
                Alert.alert("Not Eligible", "You must be an employee for at least 1 year to register.");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong.");
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

                    {/* 1. Name Fields */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholderTextColor="#999"
                            editable={!loading}
                        />
                    </View>
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholderTextColor="#999"
                            editable={!loading}
                        />
                    </View>
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Middle Initial"
                            value={middleInitial}
                            maxLength={1}
                            onChangeText={setMiddleInitial}
                            placeholderTextColor="#999"
                            editable={!loading}
                        />
                    </View>

                    {/* 2. Department */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="College Department"
                            value={department}
                            onChangeText={setDepartment}
                            placeholderTextColor="#999"
                            editable={!loading}
                        />
                    </View>

                    {/* 3. Birthday */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Birthday (YYYY-MM-DD) (Optional)"
                            value={birthday}
                            onChangeText={setBirthday}
                            placeholderTextColor="#999"
                            editable={!loading}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* 4. Email */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor="#999"
                            editable={!loading}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* 5. Cellphone */}
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <Text style={styles.phonePrefix}>+63</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Cellphone Number (optional)"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholderTextColor="#999"
                            editable={!loading}
                        />
                    </View>

                    {/* 6-7. Passwords */}
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

                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Confirm Password"
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            editable={!loading}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* 8. Appointment Date */}
                    <Text style={[styles.subHeader, styles.mtSmall]}>
                        When did you start your appointment?
                    </Text>
                    <View style={[styles.inputContainer, styles.marginTop]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Appointment Date (YYYY-MM-DD)"
                            value={appointmentDate}
                            onChangeText={setAppointmentDate}
                            editable={!loading}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
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
    title: { width: 200, height: 200 },
    formContainer: { padding: 12, marginTop: 40, width: "100%" },
    header: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
    subHeader: { fontSize: 12, color: "#6B7280", marginTop: 4 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 6,
        padding: 12,
    },
    textInput: { flex: 1, color: "#1F2937", fontSize: 14 },
    marginTop: { marginTop: 8 },
    mtSmall: { marginTop: 12 },
    phonePrefix: { marginRight: 6, color: "#1F2937", fontSize: 14 },
    button: { padding: 12, borderRadius: 6, backgroundColor: "#3B82F6", marginTop: 16 },
    buttonDisabled: { backgroundColor: "#60A5FA" },
    buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    activityIndicator: { marginRight: 6 },
    buttonText: { color: "white", textAlign: "center", fontWeight: "500", fontSize: 14 },
    linkText: { fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 6 },
    link: { color: "#3B82F6" },
    linkDisabled: { opacity: 0.5 },
});
