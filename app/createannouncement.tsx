import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "https://notipaygobackend.onrender.com";

const CreateAnnouncementAndPayment = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAnnouncementAndPayment = async () => {
    // Validate inputs
    if (!title || !content || !amount) {
      Alert.alert(
        "Error",
        "Please fill in all fields: title, content, and amount"
      );
      return;
    }

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Amount must be a positive number");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create announcement
      await axios.post(
        `${API_BASE_URL}/api/announcement`,
        {
          title,
          content,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Step 2: Create bulk payment
      const paymentResponse = await axios.post(
        `${API_BASE_URL}/api/bulk-payment`,
        {
          amount: parsedAmount,
          title,
          description: content, // Use content as description for payment
          exclude_id: "68d6aadf4ee098645ac87d5d", // Hardcoded excluded user ID
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert(
        "Success",
        `Announcement created successfully and ${paymentResponse.data.length} payments created`
      );

      // Reset form
      setTitle("");
      setContent("");
      setAmount("");
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to create announcement or payments: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <View className="flex-1 items-center justify-center">
        <View className="flex-1 w-full px-5 mt-8">
          <Text className="text-lg text-gray-800 mb-4">Title</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
          <Text className="text-lg text-gray-800 mb-4">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 h-32"
            placeholder="Payment Description"
            value={content}
            onChangeText={setContent}
            multiline
            placeholderTextColor="#999"
          />
          <Text className="text-lg text-gray-800 mb-4">Amount</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            placeholder="Enter payment amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            className="bg-deepblue px-3 py-3 rounded-md"
            onPress={handleCreateAnnouncementAndPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-center">
                Create Announcement & Payments
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateAnnouncementAndPayment;
