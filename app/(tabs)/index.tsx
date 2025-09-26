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
import { paymentNoticeApi, PaymentNotice, mapStatusToDisplay} from '../../services/api';

const PaymentList = () => {
    const [paymentRequests, setPaymentRequests] = useState<PaymentNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadPaymentRequests();
    }, []);

    const loadPaymentRequests = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('accessToken');
            
            if (!token) {
                router.push('/login');
                return;
            }

            const result = await paymentNoticeApi.getMyPaymentRequests();
            setPaymentRequests(result || []);
        } catch (error) {
            console.error('Load payment requests error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadPaymentRequests();
        setRefreshing(false);
    };

    const handlePay = async (notice: PaymentNotice) => {
        if (notice.status === 1) { // 1 = Paid
            router.push({
                pathname: '/receipt',
                params: { 
                    noticeId: notice.id, 
                    title: notice.title, 
                    amount: notice.amount.toString(),
                    currency: notice.currency,
                    description: notice.description || '',
                    createdAt: notice.createdAt,
                    paidAt: notice.paidAt || '',
                    status: notice.status.toString(),
                    paymentUrl: notice.xenditPaymentLinkUrl || ''
                }
            });
            return;
        }

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
                                currency: notice.currency,
                                description: notice.description || '',
                                paymentUrl: notice.xenditPaymentLinkUrl || ''
                            }
                        });
                    }
                },
            ]
        );
    };

    const getStatusInfo = (status: number) => {
        const displayStatus = mapStatusToDisplay(status);
        
        switch (status) {
            case 1: // Paid
                return { 
                    color: '#10B981', 
                    bgColor: '#D1FAE5', 
                    icon: 'checkmark-circle',
                    text: displayStatus 
                };
            case 0: // Pending
                return { 
                    color: '#F59E0B', 
                    bgColor: '#FEF3C7', 
                    icon: 'time-outline',
                    text: displayStatus 
                };
            case 2: // Failed
                return { 
                    color: '#EF4444', 
                    bgColor: '#FECACA', 
                    icon: 'close-circle',
                    text: displayStatus 
                };
            case 3: // Expired
                return { 
                    color: '#6B7280', 
                    bgColor: '#F3F4F6', 
                    icon: 'clock-outline',
                    text: displayStatus 
                };
            default:
                return { 
                    color: '#6B7280', 
                    bgColor: '#F3F4F6', 
                    icon: 'help-circle',
                    text: displayStatus 
                };
        }
    };

    const formatAmount = (amount: number, currency: string) => {
        return `${currency === 'PHP' ? '₱' : currency} ${amount.toLocaleString('en-PH')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Loading your payments...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const pendingCount = paymentRequests.filter(p => p.status === 0).length;
    const paidCount = paymentRequests.filter(p => p.status === 1).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Payment Requests</Text>
                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{pendingCount}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{paidCount}</Text>
                            <Text style={styles.statLabel}>Paid</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.reloadButton}
                            onPress={handleRefresh}
                            disabled={refreshing}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={refreshing ? 'refresh' : 'reload'}
                                size={24}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Payment List */}
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#6366F1']}
                        tintColor="#6366F1"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {paymentRequests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="wallet-outline" size={80} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No payment requests yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Payment requests will appear here when someone asks you to pay
                        </Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {paymentRequests.map((item) => {
                            const statusInfo = getStatusInfo(item.status);
                            
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.paymentCard,
                                        item.status === 1 && styles.paidCard
                                    ]}
                                    onPress={() => handlePay(item)}
                                    activeOpacity={0.95}
                                >
                                    {/* Left Section - Title & Description */}
                                    <View style={styles.leftSection}>
                                        <Text style={styles.title} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        {item.description && (
                                            <Text style={styles.description} numberOfLines={1}>
                                                {item.description}
                                            </Text>
                                        )}
                                        <Text style={styles.date}>
                                            {formatDate(item.createdAt)}
                                        </Text>
                                    </View>

                                    {/* Right Section - Amount & Status */}
                                    <View style={styles.rightSection}>
                                        {/* Amount */}
                                        <View style={styles.amountContainer}>
                                            <Text style={styles.currencySymbol}>
                                                {item.currency === 'PHP' ? '₱' : item.currency}
                                            </Text>
                                            <Text style={styles.amount}>
                                                {item.amount.toLocaleString('en-PH')}
                                            </Text>
                                        </View>

                                        {/* Status Badge */}
                                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                                            <Ionicons 
                                                name={statusInfo.icon as any} 
                                                size={16} 
                                                color={statusInfo.color} 
                                            />
                                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                                {statusInfo.text}
                                            </Text>
                                        </View>

                                        {/* Action Button */}
                                        {item.status !== 1 && (
                                            <TouchableOpacity
                                                style={styles.payButton}
                                                onPress={() => handlePay(item)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.payButtonText}>Pay Now</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Summary Footer */}
            {paymentRequests.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerLabel}>Pending Payments:</Text>
                        <Text style={styles.footerValue}>{pendingCount}</Text>
                    </View>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerLabel}>Total Paid:</Text>
                        <Text style={[styles.footerValue, styles.paidValue]}>{paidCount}</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    header: {
        backgroundColor: '#6366F1',
        padding: 20,
        paddingTop: 10,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    reloadButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
    },
    scrollView: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    paidCard: {
        backgroundColor: '#F0FDF4',
        borderColor: '#A7F3D0',
    },
    leftSection: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#94A3B8',
    },
    rightSection: {
        alignItems: 'flex-end',
        minWidth: 120,
    },
    amountContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    currencySymbol: {
        fontSize: 14,
        color: '#6366F1',
        marginBottom: 2,
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
        minWidth: 80,
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    payButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    payButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: 'white',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    footerLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    paidValue: {
        color: '#10B981',
    },
});

export default PaymentList;
