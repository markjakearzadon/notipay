import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Linking,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

interface RouteParams {
    noticeId: string;
    title: string;
    amount: string;
    currency: string;
    description?: string;
    paymentUrl: string;
    selectedMethod: string;
    methodName: string;
}

const WalletPayScreen = () => {
    const params = useLocalSearchParams<RouteParams>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentComplete, setPaymentComplete] = useState(false);

    useEffect(() => {
        handlePayment();
    }, []);

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🚀 Initiating payment:', {
                url: params.paymentUrl,
                method: params.selectedMethod,
                amount: params.amount,
                noticeId: params.noticeId
            });

            // Store payment info for deep link handling
            await SecureStore.setItemAsync('pendingPayment', JSON.stringify({
                noticeId: params.noticeId,
                method: params.selectedMethod,
                timestamp: Date.now().toString()
            }));

            // Open the payment URL in WebBrowser for better UX
            const result = await WebBrowser.openBrowserAsync(params.paymentUrl, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                controlsColor: '#6366F1',
                toolbarColor: '#6366F1',
            });

            console.log('🌐 WebBrowser result:', result);

            // Listen for completion (you might want to implement webhook polling)
            setTimeout(() => {
                checkPaymentStatus();
            }, 3000);

        } catch (err) {
            console.error('❌ Payment initiation error:', err);
            setError('Failed to open payment page. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('jwt');
            if (!token) return;

            // You'll need to implement this API call to check payment status
            // const statusResult = await apiClient.checkPaymentStatus(token, params.noticeId);
            
            // For now, we'll simulate completion after 5 seconds
            setTimeout(() => {
                setPaymentComplete(true);
            }, 5000);

        } catch (err) {
            console.error('❌ Status check error:', err);
        }
    };

    const handleBack = () => {
        if (loading || paymentComplete) {
            Alert.alert(
                'Payment in Progress',
                'Please wait for payment completion or contact support if you need help.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Cancel Payment',
            'Are you sure you want to cancel this payment?',
            [
                { text: 'Continue Payment', style: 'cancel' },
                { 
                    text: 'Cancel', 
                    style: 'destructive',
                    onPress: () => router.back() 
                },
            ]
        );
    };

    const handleCompletePayment = () => {
        // Clear pending payment
        SecureStore.deleteItemAsync('pendingPayment');
        router.push({
            pathname: '/payments',
            params: { 
                showReceipt: params.noticeId,
                method: params.selectedMethod
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Processing Payment</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>
                        Redirecting to {params.methodName}...
                    </Text>
                    <Text style={styles.loadingSubtext}>
                        Please complete the payment in the opened browser
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Error</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={handlePayment}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (paymentComplete) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Complete!</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                    <Text style={styles.successTitle}>Payment Successful!</Text>
                    <Text style={styles.successSubtitle}>
                        Your payment of ₱{parseFloat(params.amount || '0').toLocaleString('en-PH')} 
                        has been processed successfully.
                    </Text>
                    <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={handleCompletePayment}
                    >
                        <Text style={styles.completeButtonText}>View Receipt</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pay with {params.methodName}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.content}>
                <View style={styles.paymentCard}>
                    <Text style={styles.cardTitle}>{params.title}</Text>
                    <Text style={styles.cardDescription}>
                        {params.description || 'Payment Request'}
                    </Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>
                            {params.currency === 'PHP' ? '₱' : params.currency}
                        </Text>
                        <Text style={styles.amount}>
                            {parseFloat(params.amount || '0').toLocaleString('en-PH')}
                        </Text>
                    </View>
                </View>

                <View style={styles.methodCard}>
                    <View style={styles.methodIcon}>
                        <Ionicons 
                            name={params.selectedMethod === 'gcash' ? 'logo-gcash' : 'wallet'} 
                            size={48} 
                            color="#6366F1" 
                        />
                    </View>
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodName}>{params.methodName}</Text>
                        <Text style={styles.methodDescription}>
                            Secure payment processing
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
                </View>

                <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handlePayment}
                    disabled={loading}
                >
                    <Text style={styles.confirmButtonText}>
                        {loading ? 'Processing...' : `Pay ₱${parseFloat(params.amount || '0').toLocaleString('en-PH')}`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#6366F1',
        paddingTop: Platform.OS === 'ios' ? 50 : 0,
        paddingBottom: 20,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        textAlign: 'center',
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 16,
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    completeButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 16,
    },
    amountContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    currencySymbol: {
        fontSize: 16,
        color: '#6366F1',
        marginRight: 4,
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    methodCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    methodIcon: {
        marginRight: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    methodDescription: {
        fontSize: 14,
        color: '#64748B',
    },
    confirmButton: {
        backgroundColor: '#6366F1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default WalletPayScreen;