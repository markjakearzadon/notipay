import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function ProfileScreen() {
    return (
	<SafeAreaView style={styles.container}>
	    <ScrollView contentContainerStyle={styles.scrollContainer}>
		{/* Header */}
		<View style={styles.header}>
		    <Image
			source={{
			    uri: "https://i.pravatar.cc/150?img=32" || "https://static.xx.fbcdn.net/rsrc.php/v3/yo/r/UlIqmHJn-SK.png",
			}}
			       style={styles.avatar}
		    />
		    <Text style={styles.name}>Notipay User</Text>
		    <Text style={styles.handle}>@notipay</Text>
		</View>

		{/* Quick Actions */}
		<View style={styles.actionRow}>
		    <TouchableOpacity style={styles.actionButton}>
			<Ionicons name="card-outline" size={22} color="#2563EB" />
			<Text style={styles.actionText}>My Cards</Text>
		    </TouchableOpacity>

		    <TouchableOpacity style={styles.actionButton}>
			<MaterialIcons name="history" size={22} color="#2563EB" />
			<Text style={styles.actionText}>History</Text>
		    </TouchableOpacity>
		</View>

		{/* Menu */}
		<View style={styles.menu}>
		    <TouchableOpacity style={styles.menuItem}>
			<Ionicons name="lock-closed-outline" size={20} color="#374151" />
			<Text style={styles.menuText}>Security Settings</Text>
		    </TouchableOpacity>

		    <TouchableOpacity style={styles.menuItem}>
			<FontAwesome5 name="wallet" size={18} color="#374151" />
			<Text style={styles.menuText}>Account Balance</Text>
		    </TouchableOpacity>

		    <TouchableOpacity style={styles.menuItem}>
			<Ionicons name="gift-outline" size={20} color="#374151" />
			<Text style={styles.menuText}>Rewards</Text>
		    </TouchableOpacity>

		    <TouchableOpacity style={styles.menuItem}>
			<Ionicons name="settings-outline" size={20} color="#374151" />
			<Text style={styles.menuText}>App Settings</Text>
		    </TouchableOpacity>

		    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
			<MaterialIcons name="logout" size={20} color="#EF4444" />
			<Text style={[styles.menuText, { color: "#EF4444" }]}>Log Out</Text>
		    </TouchableOpacity>
		</View>
	    </ScrollView>
	</SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
	flex: 1,
	backgroundColor: "#F2F3F5",
    },
    scrollContainer: {
	paddingVertical: 24,
	paddingHorizontal: 16,
    },
    header: {
	alignItems: "center",
	marginBottom: 28,
    },
    avatar: {
	width: 90,
	height: 90,
	borderRadius: 45,
	marginBottom: 12,
	marginTop: 55,
    },
    name: {
	fontSize: 20,
	fontWeight: "700",
	color: "#111827",
    },
    handle: {
	fontSize: 14,
	color: "#6B7280",
	marginTop: 2,
    },
    actionRow: {
	flexDirection: "row",
	justifyContent: "space-between",
	marginBottom: 24,
    },
    actionButton: {
	flex: 1,
	backgroundColor: "#FFFFFF",
	paddingVertical: 14,
	borderRadius: 12,
	marginHorizontal: 6,
	alignItems: "center",
	justifyContent: "center",
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowRadius: 4,
	elevation: 2,
    },
    actionText: {
	fontSize: 15,
	fontWeight: "600",
	color: "#111827",
	marginTop: 6,
    },
    menu: {
	backgroundColor: "#FFFFFF",
	borderRadius: 12,
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowRadius: 4,
	elevation: 2,
    },
    menuItem: {
	flexDirection: "row",
	alignItems: "center",
	paddingVertical: 16,
	paddingHorizontal: 16,
	borderBottomWidth: 1,
	borderBottomColor: "#E5E7EB",
	gap: 12,
    },
    menuText: {
	fontSize: 16,
	color: "#111827",
    },
});
