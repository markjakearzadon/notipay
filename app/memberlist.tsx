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
  fullname: string;
  email: string;
  created_at: string;
  gcash_number: string;
  role: string;
}

const API_URL = "https://notipaygobackend-ev1s.onrender.com/api/user";

const MemberList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setUsers(Array.isArray(data.data) ? data.data : data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchMembers();
  }, []);

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        className="px-4"
      />
      {/* Payment Request Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-xl font-bold mb-4">
              Create Payment Request
            </Text>
            <TextInput
              className="border border-gray-300 p-2 mb-4 rounded"
              placeholder="Title"
              value={paymentForm.title}
              onChangeText={(text) =>
                setPaymentForm({ ...paymentForm, title: text })
              }
            />
            <TextInput
              className="border border-gray-300 p-2 mb-4 rounded"
              placeholder="Description"
              value={paymentForm.description}
              onChangeText={(text) =>
                setPaymentForm({ ...paymentForm, description: text })
              }
            />
            <TextInput
              className="border border-gray-300 p-2 mb-4 rounded"
              placeholder="Amount"
              keyboardType="numeric"
              value={paymentForm.amount.toString()}
              onChangeText={(text) =>
                setPaymentForm({ ...paymentForm, amount: Number(text) || 0 })
              }
            />
            <TextInput
              className="border border-gray-300 p-2 mb-4 rounded"
              placeholder="Currency (e.g., USD)"
              value={paymentForm.currency}
              onChangeText={(text) =>
                setPaymentForm({ ...paymentForm, currency: text })
              }
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="p-2 bg-red-500 rounded-lg w-2/5"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`p-2 rounded-lg w-2/5 ${
                  isSubmitting ? "bg-blue-300" : "bg-blue-500"
                }`}
                onPress={handleSendPaymentRequest}
                disabled={isSubmitting}
              >
                <Text className="text-white text-center">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* User Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setDetailsModalVisible(false);
          setSelectedUser(null);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-xl font-bold mb-4">User Details</Text>
            {selectedUser && (
              <>
                <Text className="text-base text-gray-800 mb-2">
                  <Text className="font-semibold">Full Name:</Text>{" "}
                  {selectedUser.fullname}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                  <Text className="font-semibold">Email:</Text>{" "}
                  {selectedUser.email}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                  <Text className="font-semibold">Role:</Text>{" "}
                  {selectedUser.role || "No role"}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                  <Text className="font-semibold">GCash Number:</Text>{" "}
                  {selectedUser.gcash_number}
                </Text>
                <Text className="text-base text-gray-800 mb-4">
                  <Text className="font-semibold">Created At:</Text>{" "}
                  {new Date(selectedUser.created_at).toLocaleString()}
                </Text>
                <Text className="text-base text-gray-800 mb-4">
                  <Text className="font-semibold">ID:</Text> {selectedUser.id}
                </Text>
              </>
            )}
            <TouchableOpacity
              className="p-2 bg-blue-500 rounded-lg"
              onPress={() => {
                setDetailsModalVisible(false);
                setSelectedUser(null);
              }}
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MemberList;
