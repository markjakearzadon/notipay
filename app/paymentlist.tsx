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
import { paymentNoticeApi, userApi, PaymentNotice, UserAdminDto, mapStatusToDisplay } from "../services/api.ts";
import title from "../assets/images/title.png";

const Payments = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [payments, setPayments] = useState<PaymentNotice[]>([]);
    const [users, setUsers] = useState<{ [key: string]: UserAdminDto }>({}); // Cache user details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const segments = ["Paid", "Unpaid"];

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                // Map selectedIndex to status filter
                const status = selectedIndex === 0 ? "PAID" : "PENDING";
                const payments = await paymentNoticeApi.getAllPayments(status);

                setPayments(payments);

                // Fetch user details for payer_id and payee_id
                const userIds = new Set<string>();
                payments.forEach((payment) => {
                    userIds.add(payment.payer_id);
                    userIds.add(payment.payee_id);
                });

                // Fetch users if not already cached
                const newUsers = await Promise.all(
                    Array.from(userIds).map(async (id) => {
                        if (!users[id]) {
                            try {
                                const user = await userApi.getAllUsers().then((users) =>
                                    users.find((u) => u.id === id)
                                );
                                return user ? { [id]: user } : null;
                            } catch {
                                return null;
                            }
                        }
                        return null;
                    })
                );

                const userMap = newUsers.reduce((acc, user) => {
                    if (user) return { ...acc, ...user };
                    return acc;
                }, {} as { [key: string]: UserAdminDto });

                setUsers((prev) => ({ ...prev, ...userMap }));
                setLoading(false);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
                setLoading(false);
            }
        };

        fetchPayments();
    }, [selectedIndex]); // Refetch when selectedIndex changes

    // Toggle payment status by calling /api/updatepayment/{paymentID}
    const togglePaymentStatus = async (paymentId: string) => {
        try {
            // Use backend's /api/updatepayment/{paymentID} endpoint
            const res = await fetchWithAuth(`/updatepayment/${paymentId}`, {
                method: "PATCH",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update payment status");
            }

            const updatedPayment = await res.json();
            setPayments((prev) =>
                prev.map((p) =>
                    p.id === paymentId
                        ? { ...p, status: updatedPayment.status === "SUCCEEDED" ? "PAID" : updatedPayment.status }
                        : p
                )
            );
            Alert.alert("Success", "Payment status updated");
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to update payment status");
        }
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
                    {payments.length > 0 ? (
                        payments.map((item) => (
                            <View
                                key={item.id}
                                className="flex-row justify-between items-center p-4 border-b border-gray-200 w-full"
                            >
                                <View className="flex-1">
                                    <Text className="text-lg text-gray-800">
                                        {item.title || "No Title"}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        Payer: {users[item.payer_id]?.userName || "Unknown"}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        Payee: {users[item.payee_id]?.userName || "Unknown"}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        Amount: ₱{item.amount}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        Status: {mapStatusToDisplay(item.status)}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    className="bg-deepblue px-3 py-2 rounded-md"
                                    onPress={() => togglePaymentStatus(item.id)}
                                    disabled={item.status === "PAID"} // Disable if already PAID
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

export default Payments;

const styles = StyleSheet.create({
    title: {
        width: 100,
        height: 100,
        justifyContent: "center",
    },
});
