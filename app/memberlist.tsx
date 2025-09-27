import React, { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator, Alert, Modal, TextInput, Button, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { paymentNoticeApi, CreatePaymentNoticeDto, PaymentNotice } from "../services/api"; // Import from api.ts

interface User {
    id: string;
    fullname: string; 
    role: string;
}

const API_URL = "https://notipaygobackend-ev1s.onrender.com/api/user"; // Updated to match api.ts endpoint

const MemberList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state to track submission
    const [paymentForm, setPaymentForm] = useState<CreatePaymentNoticeDto>({
        userId: "",
        title: "",
        description: "",
        amount: 0,
        currency: "USD", // Default currency
    });

    const fetchMembers = async () => {
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) {
                Alert.alert("Error", "No access token found. Please log in.");
                setLoading(false);
                return;
            }

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch members");
            }

            const data: User[] = await response.json();
            setUsers(data.data ?? data); // Handle both wrapped and plain responses
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSendPaymentRequest = async () => {
        if (!selectedUserId || isSubmitting) return; // Prevent submission if already in progress

        setIsSubmitting(true); // Disable button
        try {
            const paymentNotice: PaymentNotice = await paymentNoticeApi.createPaymentNotice({
                ...paymentForm,
                userId: selectedUserId,
                amount: Number(paymentForm.amount), // Ensure amount is a number
            });
            Alert.alert("Success", `Payment request "${paymentNotice.title}" sent successfully!`);
            setModalVisible(false);
            setPaymentForm({
                userId: "",
                title: "",
                description: "",
                amount: 0,
                currency: "USD",
            });
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to send payment request");
        } finally {
            setIsSubmitting(false); // Re-enable button
        }
    };

    const openPaymentModal = (userId: string) => {
        setSelectedUserId(userId);
        setPaymentForm({ ...paymentForm, userId });
        setModalVisible(true);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const renderItem = ({ item }: { item: User }) => (
	<View className="p-4 m-2 bg-gray-100 rounded-lg border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">{item.fullname}</Text> {/* Assuming you already fixed this from userName */}
            <Text className="text-base text-gray-600">{item.role}</Text>
            <Text className="text-base text-gray-600">ID: {item.id}</Text> {/* Add this line to display the ID */}
            <TouchableOpacity
		className="mt-2 p-2 bg-blue-500 rounded-lg"
		onPress={() => openPaymentModal(item.id)}
            >
		<Text className="text-white text-center">Send Payment Request</Text>
            </TouchableOpacity>
	</View>
    );

    if (loading) {
        return (
            <SafeAreaView className="h-screen w-full justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="h-screen w-full bg-white">
            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                className="px-4"
            />
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-white p-6 rounded-lg w-4/5">
                        <Text className="text-xl font-bold mb-4">Create Payment Request</Text>
                        <TextInput
                            className="border border-gray-300 p-2 mb-4 rounded"
                            placeholder="Title"
                            value={paymentForm.title}
                            onChangeText={(text) => setPaymentForm({ ...paymentForm, title: text })}
                        />
                        <TextInput
                            className="border border-gray-300 p-2 mb-4 rounded"
                            placeholder="Description"
                            value={paymentForm.description}
                            onChangeText={(text) => setPaymentForm({ ...paymentForm, description: text })}
                        />
                        <TextInput
                            className="border border-gray-300 p-2 mb-4 rounded"
                            placeholder="Amount"
                            keyboardType="numeric"
                            value={paymentForm.amount.toString()}
                            onChangeText={(text) => setPaymentForm({ ...paymentForm, amount: Number(text) || 0 })}
                        />
                        <TextInput
                            className="border border-gray-300 p-2 mb-4 rounded"
                            placeholder="Currency (e.g., USD)"
                            value={paymentForm.currency || ""}
                            onChangeText={(text) => setPaymentForm({ ...paymentForm, currency: text })}
                        />
                        <View className="flex-row justify-between">
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#EF4444" />
                            <Button
                                title="Send"
                                onPress={handleSendPaymentRequest}
                                color="#3B82F6"
                                disabled={isSubmitting} // Disable button during submission
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default MemberList;
