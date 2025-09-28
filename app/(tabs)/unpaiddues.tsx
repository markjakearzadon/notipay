import React, { useState, useEffect } from "react";
import { 
    ScrollView, 
    Text, 
    View, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    RefreshControl,
    StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { paymentNoticeApi, PaymentNotice, mapStatusToDisplay } from '../../services/api';

const PendingPayments = () => {
    const [pendingPayments, setPendingPayments] = useState<PaymentNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        const storedUserId = await SecureStore.getItemAsync('userId');
        if (!token || !storedUserId) {
            router.push('/login');
            return;
        }
        setUserId(storedUserId);
        await loadPendingPayments(storedUserId);
    };

    const loadPendingPayments = async (uid?: string) => {
        try {
            setLoading(true);
            if (!uid && !userId) throw new Error("User ID missing");
            const result = await paymentNoticeApi.getMyPaymentRequests(uid || userId!);
            const filtered = (result || []).filter(p => p.status === "PENDING");
            setPendingPayments(filtered);
        } catch (error) {
            console.error('Load pending payments error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadPendingPayments();
        setRefreshing(false);
    };

    const handlePay = async (notice: PaymentNotice) => {
        Alert.alert(
            'Confirm Payment',
            `Pay ₱${notice.amount.toLocaleString('en-PH')} for "${notice.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Pay Now', 
                    style: 'destructive',
                    onPress: () => {
                        router.push({
                            pathname: '/pay',
                            params: { 
                                noticeId: notice.id, 
                                title: notice.title, 
                                amount: notice.amount.toString(),
                                description: notice.description || '',
                                paymentUrl: notice.checkout_url
                            }
                        });
                    }
                },
            ]
        );
    };

    const formatAmount = (amount: number) => `₱ ${amount.toLocaleString('en-PH')}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Loading your pending payments...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pending Payments</Text>
                <Text style={styles.headerSubtitle}>
                    You have {pendingPayments.length} pending {pendingPayments.length === 1 ? "payment" : "payments"}
                </Text>
            </View>

            {/* Payment List */}
            <ScrollView 
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6366F1']} />}
                showsVerticalScrollIndicator={false}
            >
                {pendingPayments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="time-outline" size={80} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No pending payments</Text>
                        <Text style={styles.emptySubtitle}>You’re all caught up 🎉</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {pendingPayments.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.paymentCard}
                                onPress={() => handlePay(item)}
                                activeOpacity={0.95}
                            >
                                <View style={styles.leftSection}>
                                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                                    {item.description && <Text style={styles.description} numberOfLines={1}>{item.description}</Text>}
                                    <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                                </View>

                                <View style={styles.rightSection}>
                                    <View style={styles.amountContainer}>
                                        <Text style={styles.currencySymbol}>₱</Text>
                                        <Text style={styles.amount}>{item.amount.toLocaleString('en-PH')}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item)} activeOpacity={0.8}>
                                        <Text style={styles.payButtonText}>Pay Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PendingPayments;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#64748B', fontWeight: '500' },
    header: { backgroundColor: '#6366F1', padding: 20, paddingTop: 10, alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { marginTop: 8, fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' },
    scrollView: { flex: 1 },
    listContainer: { padding: 16, paddingBottom: 20 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#64748B', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    leftSection: { flex: 1, marginRight: 16 },
    title: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
    description: { fontSize: 14, color: '#64748B', marginBottom: 4 },
    date: { fontSize: 12, color: '#94A3B8' },
    rightSection: { alignItems: 'flex-end', minWidth: 120 },
    amountContainer: { alignItems: 'center', marginBottom: 12 },
    currencySymbol: { fontSize: 14, color: '#6366F1', marginBottom: 2 },
    amount: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    payButton: { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    payButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
});

