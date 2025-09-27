import * as SecureStore from "expo-secure-store";
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
import { paymentNoticeApi, userApi, PaymentNotice, UserAdminDto, mapStatusToDisplay } from "../services/api";
import title from "../assets/images/title.png";

interface UserAdminDto {
  id: string;
  fullname: string;
  email: string;
  created_at: string;
  gcash_number: string;
  role: string;
}

interface PaymentNotice {
  id: string;
  reference_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  title: string;
  description: string;
  status: string;
  charge_id: string;
  disbursement_id: string;
  checkout_url: string;
  created_at: string;
  updated_at: string;
}

const API_URL = "https://notipaygobackend-ev1s.onrender.com/api";

const Payments = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [payments, setPayments] = useState<PaymentNotice[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserAdminDto }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const segments = ["Paid", "Unpaid"];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const status = selectedIndex === 0 ? "PAID" : "PENDING";
      const payments = await paymentNoticeApi.getAllPayments(status);

      setPayments(payments);

      // Fetch user details for payer_id and payee_id only if necessary
      const userIds = new Set<string>();
      payments.forEach((payment) => {
        if (!users[payment.payer_id]) userIds.add(payment.payer_id);
        if (!users[payment.payee_id]) userIds.add(payment.payee_id);
      });

      if (userIds.size > 0) {
        const newUsers = await Promise.all(
          Array.from(userIds).map(async (id) => {
            try {
              const user = await userApi.getAllUsers().then((users) =>
                users.find((u) => u.id === id)
              );
              return user ? { [id]: user } : null;
            } catch {
              return null;
            }
          })
        );

        const userMap = newUsers.reduce((acc, user) => {
          if (user) return { ...acc, ...user };
          return acc;
        }, {} as { [key: string]: UserAdminDto });

        setUsers((prev) => ({ ...prev, ...userMap }));
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const togglePaymentStatus = async (paymentId: string) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const res = await fetch(`${API_URL}/updatepayment/${paymentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update payment status");
      }

      const updatedPayment = await res.json();
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: updatedPayment.status } : p
        )
      );
      Alert.alert("Success");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update payment status");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedIndex]);

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
          {payments.length > 0 ? (
            payments.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center p-4 border-b border-gray-200 w-full"
              >
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    {item.title || "No Title"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Payer: {users[item.payer_id]?.fullname || "Unknown"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Payee: {users[item.payee_id]?.fullname || "Unknown"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Amount: ₱{item.amount.toFixed(2)}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Status: {mapStatusToDisplay(item.status)}
                  </Text>
                </View>
                <TouchableOpacity
                  className={`px-3 py-2 rounded-md ${
                    item.status === "PENDING" ? "bg-blue-600" : "bg-gray-400"
                  }`}
                  onPress={() => togglePaymentStatus(item.id)}
                  disabled={item.status !== "PENDING"}
                >
                  <Text className="text-white text-sm font-semibold">
                    {item.status === "PENDING" ? "Mark as Paid" : "Paid"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-base text-gray-600 text-center">
              No {selectedIndex === 0 ? "paid" : "unpaid"} payments found
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    width: 100,
    height: 100,
    justifyContent: "center",
  },
});

export default Payments;
