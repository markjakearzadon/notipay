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
import { paymentNoticeApi, userApi, PaymentNotice, UserAdminDto } from "../services/api";
import title from "../assets/images/title.png";

const API_URL = "https://notipaygobackend.onrender.com/api";

const Payments = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [payments, setPayments] = useState<PaymentNotice[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserAdminDto }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const segments = ["Succeeded", "Pending"];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const status = selectedIndex === 0 ? "SUCCEEDED" : "PENDING";
      const payments = await paymentNoticeApi.getAllPayments(status);

      setPayments(payments);

      // Fetch user details for payer_id and payee_id only if necessary
      const userIds = new Set<string>();
      payments.forEach((payment) => {
        if (payment.payer_id && !users[payment.payer_id]) userIds.add(payment.payer_id);
        if (payment.payee_id && !users[payment.payee_id]) userIds.add(payment.payee_id);
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
      const validStatuses = ["PENDING", "SUCCEEDED", "EXPIRED"];
      if (!validStatuses.includes(updatedPayment.status)) {
        console.warn(`Invalid status received from update: ${updatedPayment.status}`);
        Alert.alert("Error", "Received invalid payment status from server");
        return;
      }

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: updatedPayment.status } : p
        )
      );
      Alert.alert("Success", "Payment status updated");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update payment status");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedIndex]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={title} style={styles.title} />
        <SegmentedControl
          values={segments}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          style={styles.segmentedControl}
          appearance="dark"
          fontStyle={{ fontSize: 16 }}
          activeFontStyle={{ fontWeight: "bold" }}
        />
      </View>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {payments.length > 0 ? (
            payments.map((item) => (
              <View key={item.id} style={styles.paymentItem}>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentTitle}>
                    {item.title || "No Title"}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Payer: {users[item.payer_id]?.userName || "Unknown"}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Payee: {users[item.payee_id]?.userName || "Unknown"}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Amount: ₱{item.amount.toFixed(2)}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Status: {mapStatusToDisplay(item.status)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.status === "PENDING"
                      ? styles.activeButton
                      : styles.disabledButton,
                  ]}
                  onPress={() => togglePaymentStatus(item.id)}
                  disabled={item.status !== "PENDING"}
                >
                  <Text style={styles.actionButtonText}>
                    {item.status === "PENDING" ? "Mark as Succeeded" : "Succeeded"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No {segments[selectedIndex].toLowerCase()} payments found
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 32,
  },
  title: {
    width: 100,
    height: 100,
  },
  segmentedControl: {
    width: 200,
    marginTop: 20,
  },
  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 32,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    width: "100%",
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  paymentInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: "#2563EB",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
  },
});

export default Payments;
