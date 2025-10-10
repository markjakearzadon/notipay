import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserInfo, authApi } from "../../services/api";
import { useRouter } from "expo-router";

// Generate initials if no profile picture
const getInitials = (user: any) => {
    return [user.first_name, user.middle_initial, user.last_name]
        .map(n => n?.[0] || "")
        .join("")
        .toUpperCase();
};

// Get full name
const getFullName = (user: any) =>
    [user.first_name, user.middle_initial, user.last_name].filter(Boolean).join(" ");

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const info = await getUserInfo();
            setUser(info);
            setLoading(false);
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        await authApi.logout();
        router.replace("/login");
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#2b7fff" />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>No user info found.</Text>
                <TouchableOpacity onPress={() => router.replace("/login")} style={styles.btn}>
                    <Text style={styles.btnText}>Go to Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                {/* Placeholder avatar, can replace with real image if API provides */}
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{getInitials(user)}</Text>
                </View>
            </View>

            {/* Full Name */}
            <Text style={styles.fullname}>{getFullName(user)}</Text>

            {/* Info cards */}
            <View style={styles.infoCard}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>College Department</Text>
                <Text style={styles.value}>{user.college_department || "N/A"}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Cellphone Number</Text>
                <Text style={styles.value}>{user.cellphone_number || "N/A"}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Role</Text>
                <Text style={styles.value}>{user.role}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Joined</Text>
                <Text style={styles.value}>{new Date(user.created_at).toLocaleDateString()}</Text>
            </View>

            {/* Logout button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
        alignItems: "center",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarContainer: {
        marginBottom: 15,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#2b7fff",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },
    fullname: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "#333",
    },
    infoCard: {
        width: "100%",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    label: {
        fontSize: 12,
        color: "#888",
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    logoutBtn: {
        marginTop: 30,
        width: "100%",
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    logoutText: {
        color: "#e74c3c",
        fontWeight: "600",
        fontSize: 16,
    },
    btn: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#2b7fff",
        borderRadius: 8,
    },
    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
});
