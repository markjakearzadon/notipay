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
import title from "../assets/images/title.png";

export type PaymentNotice = {
  id: string;
  reference_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  title: string;
  description: string;
  status: string;
  invoice_id: string;
  disbursement_id: string;
  checkout_url: string;
  created_at: string;
  updated_at: string;
};

const mapStatusToDisplay = (status: string) => {
  switch (status) {
    case "SUCCEEDED":
      return "Paid";
    case "PENDING":
      return "Pending";
    case "EXPIRED":
      return "Expired";
    default:
      return status;
  }
};

const Payments = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [payments, setPayments] = useState<PaymentNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

  const segments = ["Paid", "Pending"];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://notipaygobackend.onrender.com/api/payments");
      if (!res.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data: PaymentNotice[] = await res.json();

      // filter locally based on selectedIndex
      const status = selectedIndex === 0 ? "SUCCEEDED" : "PENDING";
      const filtered = data.filter((p) => p.status === status);

      setPayments(filtered);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const togglePaymentStatus = async (paymentId: string) => {
    if (updatingPaymentId) return;
    setUpdatingPaymentId(paymentId);

    try {
      const res = await fetch(
        `https://notipaygobackend.onrender.com/api/updatepayment/${paymentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
          p.id === paymentId
            ? { ...p, status: updatedPayment.status, updated_at: updatedPayment.updated_at }
            : p
        )
      );
      Alert.alert("Success", "Payment status updated to Paid");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update payment status");
    } finally {
      setUpdatingPaymentId(null);
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
          {payments.length === 0 ? (
            <Text style={styles.emptyText}>
              No {segments[selectedIndex].toLowerCase()} payments found
            </Text>
          ) : (
            payments.map((item) => (
              <View key={item.id} style={styles.paymentItem}>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentTitle}>
                    {item.title || "Untitled Payment"}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Amount: ₱{item.amount.toFixed(2)}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Description: {item.description || "No description"}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Status: {mapStatusToDisplay(item.status)}
                  </Text>
                  <Text style={styles.paymentInfo}>
                    Last Updated: {new Date(item.updated_at).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.status === "PENDING" && !updatingPaymentId
                      ? styles.activeButton
                      : styles.disabledButton,
                  ]}
                  onPress={() => togglePaymentStatus(item.id)}
                  disabled={item.status !== "PENDING" || updatingPaymentId === item.id}
                >
                  <Text style={styles.actionButtonText}>
                    {item.status === "PENDING" && !updatingPaymentId
                      ? "Mark as Paid"
                      : item.status === "PENDING" && updatingPaymentId === item.id
                      ? "Updating..."
                      : "Paid"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
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
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
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
    marginTop: 6,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
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

