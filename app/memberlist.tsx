import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Image } from "react-native";
import title from "../assets/images/title.png";

interface User {
  id: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  email: string;
  created_at: string;
  gcash_number: string;
  role: string;
  status: string;
}

interface CreatePaymentDto {
  payer_cellphone_number: string;
  payee_id: string;
  amount: number;
  title: string;
  description: string;
}

interface PaymentResponse {
  id: string;
  reference_id: string;
  payer_id: string;
  payer_name: string;
  payee_id: string;
  payee_name: string;
  amount: number;
  title: string;
  description: string;
  status: string;
  invoice_id: string;
  disbursement_id: string;
  checkout_url: string;
  created_at: string;
  updated_at: string;
}

const API_URL = "https://notipaygobackend.onrender.com/api/user";
const UPDATE_STATUS_URL = "https://notipaygobackend.onrender.com/api/updatestatus";
const PAYMENT_API_URL = "https://notipaygobackend.onrender.com/api/payment";

const MemberList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paymentForm, setPaymentForm] = useState<CreatePaymentDto>({
    payer_cellphone_number: "",
    payee_id: "",
    title: "",
    description: "",
    amount: 0,
  });

  const segments = ["Pending", "Active"];
  const filterCriteria = ["pending", "active"];

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for Philippine phone numbers (e.g., starts with "09" and 11 digits)
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateAmount = (amount: string): boolean => {
    const num = Number(amount);
    return !isNaN(num) && num > 0;
  };

  const fetchMembers = async () => {
    try {
      if (!refreshing) setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`Failed to fetch members: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const rawUsers = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const mappedUsers: User[] = rawUsers
        .filter((user: any) => user.role !== "admin")
        .map((user: any) => ({
          id: user.id,
          first_name: user.first_name || "",
          middle_initial: user.middle_initial || "",
          last_name: user.last_name || "",
          email: user.email || "",
          created_at: user.created_at || "",
          gcash_number: user.cellphone_number || "",
          role: user.role || "",
          status: user.status || "",
        }));

      const filteredUsers = mappedUsers.filter((user) => user.status === filterCriteria[selectedIndex]);

      setUsers(filteredUsers);
      setError(null);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      const errorMessage = err.message || "Failed to fetch members";
      Alert.alert("Error", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMembers();
  }, [selectedIndex]);

  const handleAuthorizeUser = async (userId: string) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(`${UPDATE_STATUS_URL}/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Added Authorization header
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`Failed to authorize user: ${response.status}`);
      }

      Alert.alert("Success", "User authorized successfully!");
      setDetailsModalVisible(false);
      setSelectedUser(null);
      await fetchMembers();
    } catch (err: any) {
      console.error("Authorize Error:", err);
      Alert.alert("Error", err.message || "Failed to authorize user");
    }
  };

  const handleSendPaymentRequest = async () => {
    if (!selectedUser?.id || isSubmitting) return;

    if (!paymentForm.title) {
      Alert.alert("Error", "Title is required.");
      return;
    }

    if (!validatePhoneNumber(paymentForm.payer_cellphone_number)) {
      Alert.alert("Error", "Please enter a valid phone number (e.g., 09XXXXXXXXX).");
      return;
    }

    if (!validateAmount(paymentForm.amount.toString())) {
      Alert.alert("Error", "Please enter a valid amount greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(PAYMENT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payer_cellphone_number: paymentForm.payer_cellphone_number,
          payee_id: "asd",
          amount: Number(paymentForm.amount),
          title: paymentForm.title,
          description: paymentForm.description || "", // Ensure description is not undefined
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        if (response.status === 400) {
          throw new Error("Invalid payment details. Please check your inputs.");
        }
        throw new Error(`Failed to create payment: ${response.status}`);
      }

      const payment: PaymentResponse = await response.json();
      Alert.alert(
        "Success",
        `Payment request "${payment.title}" sent successfully!\nCheckout URL: ${payment.checkout_url}`,
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );
      resetForm();
    } catch (err: any) {
      console.error("Payment Request Error:", err);
      Alert.alert("Error", err.message || "Failed to send payment request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPaymentForm({
      payer_cellphone_number: "",
      payee_id: "",
      title: "",
      description: "",
      amount: 0,
    });
    setSelectedUser(null);
    setModalVisible(false);
  };

  const openPaymentModal = (user: User) => {
    setSelectedUser(user);
    setPaymentForm({
      payer_cellphone_number: user.gcash_number || "",
      payee_id: user.id,
      title: "",
      description: "",
      amount: 0,
    });
    setModalVisible(true);
  };

  const openDetailsModal = (user: User) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedIndex]);

  if (loading && !refreshing) {
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {users.length === 0 ? (
            <Text style={styles.emptyText}>
              No {segments[selectedIndex].toLowerCase()} users found
            </Text>
          ) : (
            users.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.userItem}
                onPress={() => openDetailsModal(item)}
              >
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {item.first_name} {item.middle_initial}. {item.last_name}
                  </Text>
                  <Text style={styles.userInfo}>Email: {item.email}</Text>
                  <Text style={styles.userInfo}>Role: {item.role || "No role"}</Text>
                  <Text style={styles.userInfo}>Status: {item.status}</Text>
                  <Text style={styles.userInfo}>
                    Created: {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Payment Request Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Payment Request</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (e.g., 09XXXXXXXXX)"
              keyboardType="phone-pad"
              value={paymentForm.payer_cellphone_number}
              onChangeText={(text) => setPaymentForm({ ...paymentForm, payer_cellphone_number: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={paymentForm.title}
              onChangeText={(text) => setPaymentForm({ ...paymentForm, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={paymentForm.description}
              onChangeText={(text) => setPaymentForm({ ...paymentForm, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="decimal-pad"
              value={paymentForm.amount.toString()}
              onChangeText={(text) => setPaymentForm({ ...paymentForm, amount: Number(text) || 0 })}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#DC2626" }]}
                onPress={resetForm}
                disabled={isSubmitting}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, isSubmitting ? { backgroundColor: "#93C5FD" } : { backgroundColor: "#2563EB" }]}
                onPress={handleSendPaymentRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Send</Text>
                )}
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Details</Text>
            {selectedUser && (
              <>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>First Name:</Text> {selectedUser.first_name}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>Middle Initial:</Text> {selectedUser.middle_initial}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>Last Name:</Text> {selectedUser.last_name}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>Email:</Text> {selectedUser.email}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>Role:</Text> {selectedUser.role || "No role"}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>GCash Number:</Text> {selectedUser.gcash_number || "N/A"}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>Status:</Text> {selectedUser.status}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>Created At:</Text>{" "}
                  {new Date(selectedUser.created_at).toLocaleString()}
                </Text>
                <Text style={styles.userInfo}>
                  <Text style={{ fontWeight: "600" }}>ID:</Text> {selectedUser.id}
                </Text>
                <View style={styles.modalButtonContainer}>
                  {selectedUser.status === "pending" && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: "#2563EB" }]}
                      onPress={() => handleAuthorizeUser(selectedUser.id)}
                    >
                      <Text style={styles.modalButtonText}>Authorize</Text>
                    </TouchableOpacity>
                  )}
                  {selectedUser.status === "active" && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: "#2563EB" }]}
                      onPress={() => openPaymentModal(selectedUser)}
                    >
                      <Text style={styles.modalButtonText}>Send Payment</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#DC2626" }]}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      setSelectedUser(null);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  userInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MemberList;
