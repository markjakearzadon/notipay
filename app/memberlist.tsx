import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CreatePaymentNoticeDto,
    PaymentNotice,
    paymentNoticeApi,
} from "../services/api";

interface User {
    id: string;
    first_name: string;
    middle_initial: string;
    last_name: string;
    college_department: string;
    birthday: string;
    email: string;
    cellphone_number: string;
    created_at: string;
    role: string;
    status: string;
}

const API_URL = "https://notipaygobackend-ev1s.onrender.com/api/user";

const MemberList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [sortedUsers, setSortedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [sortBy, setSortBy] = useState<"fullname" | "created_at">("fullname");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const [paymentForm, setPaymentForm] = useState<CreatePaymentNoticeDto>({
	userId: "",
	title: "",
	description: "",
	amount: 0,
	currency: "USD",
    });

    const fetchMembers = async () => {
	setLoading(true);
	try {
            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) {
		Alert.alert("Error", "No access token found. Please log in.");
		return;
            }

            const response = await fetch(API_URL, {
		headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
		},
            });

            if (!response.ok) {
		throw new Error(`Failed to fetch members: ${response.status}`);
            }

            const data = await response.json();
            // Ensure array format
            const fetchedUsers = Array.isArray(data.data) ? data.data : data;
            // Map API fields to display-friendly objects
            const mappedUsers = fetchedUsers.map((user: any) => ({
		...user,
		fullname: `${user.first_name} ${user.middle_initial.toUpperCase()}. ${user.last_name}`,
            }));

            setUsers(mappedUsers);
            setSortedUsers(sortUsers(mappedUsers, sortBy, sortOrder));
	} catch (err: any) {
            Alert.alert("Error", err.message || "Failed to fetch members");
	} finally {
            setLoading(false);
	}
    };

    const sortUsers = (
	userList: User[],
	sortField: "fullname" | "created_at",
	order: "asc" | "desc"
    ) => {
	return [...userList].sort((a, b) => {
	    let valA =
		sortField === "fullname"
		? a.fullname.toLowerCase()
		: new Date(a.created_at).getTime();
	    let valB =
		sortField === "fullname"
		? b.fullname.toLowerCase()
		: new Date(b.created_at).getTime();

	    if (order === "asc") {
		return valA > valB ? 1 : valA < valB ? -1 : 0;
	    } else {
		return valA < valB ? 1 : valA > valB ? -1 : 0;
	    }
	});
    };

    useEffect(() => {
	setSortedUsers(sortUsers(users, sortBy, sortOrder));
    }, [users, sortBy, sortOrder]);

    useEffect(() => {
	fetchMembers();
    }, []);

    const handleSortChange = (
	field: "fullname" | "created_at",
	order: "asc" | "desc"
    ) => {
	setSortBy(field);
	setSortOrder(order);
	setDropdownVisible(false);
    };

    const renderItem = ({ item }: { item: User }) => (
	<TouchableOpacity
	    className="p-4 m-2 bg-gray-100 rounded-lg border border-gray-200"
	    onPress={() => openDetailsModal(item)}
	>
	    <Text className="text-lg font-semibold text-gray-800">
		{item.fullname}
	    </Text>
	    <Text className="text-base text-gray-600">{item.role || "No role"}</Text>
	</TouchableOpacity>
    );

    const handleSendPaymentRequest = async () => {
	if (!selectedUser?.id || isSubmitting) return;

	if (!paymentForm.title || !paymentForm.amount || !paymentForm.currency) {
	    Alert.alert("Error", "Please fill in all required fields");
	    return;
	}

	setIsSubmitting(true);
	try {
	    const paymentNotice: PaymentNotice =
		await paymentNoticeApi.createPaymentNotice({
		    ...paymentForm,
		    userId: selectedUser.id,
		    amount: Number(paymentForm.amount),
		});
	    Alert.alert(
		"Success",
		`Payment request "${paymentNotice.title}" sent successfully!`
	    );
	    setModalVisible(false);
	    resetForm();
	} catch (err: any) {
	    Alert.alert("Error", err.message || "Failed to send payment request");
	} finally {
	    setIsSubmitting(false);
	}
    };

    const resetForm = () => {
	setPaymentForm({
	    userId: "",
	    title: "",
	    description: "",
	    amount: 0,
	    currency: "USD",
	});
	setSelectedUser(null);
    };

    const openPaymentModal = (user: User) => {
	setSelectedUser(user);
	setPaymentForm({ ...paymentForm, userId: user.id });
	setModalVisible(true);
    };

    const openDetailsModal = (user: User) => {
	setSelectedUser(user);
	setDetailsModalVisible(true);
    };

    if (loading) {
	return (
	    <SafeAreaView className="flex-1 justify-center items-center bg-white">
		<ActivityIndicator size="large" color="#3B82F6" />
	    </SafeAreaView>
	);
    }

    const sortLabel =
	sortBy === "fullname"
	? `Full Name (${sortOrder === "asc" ? "Ascending" : "Descending"})`
	: `Created At (${sortOrder === "asc" ? "Ascending" : "Descending"})`;

    return (
	<SafeAreaView className="flex-1 bg-white">
	    {/* Sort Dropdown */}
	    <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
		<TouchableOpacity
		    className="flex-row justify-between items-center p-3 bg-white rounded-lg border border-gray-300"
		    onPress={() => setDropdownVisible(!dropdownVisible)}
		>
		    <Text className="text-gray-800 font-medium">Sort by: {sortLabel}</Text>
		    <Text className="text-gray-600">{dropdownVisible ? "▲" : "▼"}</Text>
		</TouchableOpacity>

		{dropdownVisible && (
		    <View className="mt-2 bg-white rounded-lg border border-gray-300">
			<TouchableOpacity
			    className="p-3 border-b border-gray-200"
			    onPress={() => handleSortChange("fullname", "asc")}
			>
			    <Text>Full Name (Ascending)</Text>
			</TouchableOpacity>
			<TouchableOpacity
			    className="p-3 border-b border-gray-200"
			    onPress={() => handleSortChange("fullname", "desc")}
			>
			    <Text>Full Name (Descending)</Text>
			</TouchableOpacity>
			<TouchableOpacity
			    className="p-3 border-b border-gray-200"
			    onPress={() => handleSortChange("created_at", "asc")}
			>
			    <Text>Created At (Ascending)</Text>
			</TouchableOpacity>
			<TouchableOpacity
			    className="p-3"
			    onPress={() => handleSortChange("created_at", "desc")}
			>
			    <Text>Created At (Descending)</Text>
			</TouchableOpacity>
		    </View>
		)}
	    </View>

	    <FlatList
		data={sortedUsers}
		     renderItem={renderItem}
		     keyExtractor={(item) => item.id}
		     className="px-4"
	    />

	    {/* Other Modals (Payment + Details) remain unchanged */}
	    {/* ... (keep your payment and details modals as is) */}
	</SafeAreaView>
    );
};

export default MemberList;
