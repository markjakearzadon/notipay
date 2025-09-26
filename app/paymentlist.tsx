import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useState, useEffect } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import title from "../assets/images/title.png";

interface User {
    id: string;
    userName: string;
    phoneNumber?: string;
    isPending?: boolean; // simulate payment status
}

const API_URL = "http://192.168.254.132:5113/api/auth/members"; // adjust if needed

const Payments = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const segments = ["Paid", "Unpaid"];

    useEffect(() => {
	const fetchUsers = async () => {
	    try {
		const token = await SecureStore.getItemAsync("accessToken");
		if (!token) {
		    Alert.alert("Error", "No access token found. Please log in.");
		    setLoading(false);
		    return;
		}

		const res = await fetch(API_URL, {
		    headers: { Authorization: `Bearer ${token}` },
		});

		if (!res.ok) throw new Error("Failed to fetch users");

		const data: User[] = await res.json();

		// Add a simulated `isPending` property for demonstration
		const usersWithStatus = data.map((u, i) => ({
		    ...u,
		    isPending: i % 2 === 0, // even index unpaid, odd index paid
		}));

		setUsers(usersWithStatus);
	    } catch (err: any) {
		setError(err.message || "Something went wrong");
	    } finally {
		setLoading(false);
	    }
	};

	fetchUsers();
    }, []);

    // Filter users based on selected segment
    const filteredData = users.filter((u) =>
	selectedIndex === 0 ? !u.isPending : u.isPending
    );

    // Toggle payment status locally
    const togglePaymentStatus = (id: string) => {
	setUsers((prev) =>
	    prev.map((u) => (u.id === id ? { ...u, isPending: !u.isPending } : u))
	);
    };

    if (loading) {
	return (
	    <SafeAreaView className="flex-1 justify-center items-center bg-white">
		<ActivityIndicator size="large" color="#2563EB" />
	    </SafeAreaView>
	);
    }

    if (error) {
	return (
	    <SafeAreaView className="flex-1 justify-center items-center bg-white">
		<Text className="text-red-600">{error}</Text>
	    </SafeAreaView>
	);
    }

    return (
	<SafeAreaView className="flex-1 bg-white">
	    <View className="items-center mt-8">
		<Image source={title} style={styles.title} />

		<SegmentedControl
		    values={segments}
		    selectedIndex={selectedIndex}
		    onChange={(event) => {
			setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
		    }}
		    style={{ width: 200, marginTop: 20 }}
		    appearance="dark"
		    fontStyle={{ fontSize: 16 }}
		    activeFontStyle={{ fontWeight: "bold" }}
		/>
	    </View>

	    <View className="flex-1 w-full px-5 mt-8">
		<ScrollView
		    contentContainerStyle={{
			flexGrow: 1,
			alignItems: "center",
			paddingBottom: 20,
		    }}
		    showsVerticalScrollIndicator={false}
		>
		    {filteredData.length > 0 ? (
			filteredData.map((item) => (
			    <View
				key={item.id}
				className="flex-row justify-between items-center p-4 border-b border-gray-200 w-full"
			    >
				<View className="flex-1">
				    <Text className="text-lg text-gray-800">{item.userName}</Text>
				    <Text className="text-sm text-gray-500">
					{item.phoneNumber ?? "No phone"}
				    </Text>
				</View>

				<TouchableOpacity
				    className="bg-deepblue px-3 py-2 rounded-md"
				    onPress={() => togglePaymentStatus(item.id)}
				>
				    <Text className="text-white text-sm font-semibold">
					{item.isPending ? "Mark as Paid" : "Mark as Unpaid"}
				    </Text>
				</TouchableOpacity>
			    </View>
			))
		    ) : (
			<Text className="text-base text-gray-600 text-center">
			    No {selectedIndex === 0 ? "paid" : "unpaid"} users found
			</Text>
		    )}
		</ScrollView>
	    </View>
	</SafeAreaView>
    );
};

export default Payments;

const styles = StyleSheet.create({
    title: {
	width: 100,
	height: 100,
	justifyContent: "center",
    },
});
