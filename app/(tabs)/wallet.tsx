import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Linking,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { getAccessToken } from '@/services/api';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const checkPaymentStatus = async () => {
        try {
            const token = await getAccessToken();
            if (!token) return;

            const res = await fetch(
                `http://10.239.1.175:5113/api/payment-notices/${params.noticeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error('Failed to fetch payment status');

            const data = await res.json();
            console.log('Payment status:', data.status);

            if (data.status === 1) { // ✅ Paid
                setPaymentComplete(true);
                await SecureStore.deleteItemAsync('pendingPayment');
                if (intervalRef.current) clearInterval(intervalRef.current);
            } else if (data.status === 2) { // ✅ Failed
                setError('Payment failed. Please try again.');
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        } catch (err) {
            console.error('Status check error:', err);
        }
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🚀 Initiating payment:', {
                url: params.paymentUrl,
                method: params.selectedMethod,
                amount: params.amount,
                noticeId: params.noticeId,
            });

            await SecureStore.setItemAsync(
                'pendingPayment',
                JSON.stringify({
                    noticeId: params.noticeId,
                    method: params.selectedMethod,
                    timestamp: Date.now().toString(),
                })
            );

            // Close the browser after 3 seconds to ensure the user has time to complete the payment
            setTimeout(() => {
                WebBrowser.dismissBrowser();
            }, 3000);

            await WebBrowser.openBrowserAsync(params.paymentUrl, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                controlsColor: '#6366F1',
                toolbarColor: '#6366F1',
            });
            
            // Start polling for payment status after the browser is opened
            intervalRef.current = setInterval(checkPaymentStatus, 3000);
        } catch (err) {
            console.error('Payment initiation error:', err);
            setError('Failed to open payment page. Please try again.');
        } finally {
            setLoading(false);
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
                    onPress: () => router.back(),
                },
            ]
        );
    };

    const handleCompletePayment = () => {
        SecureStore.deleteItemAsync('pendingPayment');
        router.push({
            pathname: '/payments',
            params: {
                showReceipt: params.noticeId,
                method: params.selectedMethod,
            },
        });
    };

    useEffect(() => {
        handlePayment();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const renderHeader = (title: string) => (
        <View className={`bg-indigo-500 py-5 px-4 flex-row items-center justify-between ${Platform.OS === 'ios' ? 'pt-12' : 'pt-0'} shadow-md`}>
            <TouchableOpacity onPress={handleBack} className="p-1">
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-white flex-1 text-center">{title}</Text>
            <View className="w-6" />
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50">
                {renderHeader('Processing Payment')}
                <View className="flex-1 justify-center items-center p-5">
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text className="mt-4 text-lg font-semibold text-slate-800 text-center">
                        Redirecting to {params.methodName}...
                    </Text>
                    <Text className="mt-2 text-sm text-slate-500 text-center">
                        Please complete the payment in the opened browser
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-slate-50">
                {renderHeader('Payment Error')}
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons name="alert-circle" size={64} color="#EF4444" />
                    <Text className="text-base font-semibold text-red-500 text-center mt-4 mb-6">
                        {error}
                    </Text>
                    <TouchableOpacity
                        className="bg-indigo-500 px-6 py-3 rounded-lg"
                        onPress={handlePayment}
                    >
                        <Text className="text-white text-base font-semibold">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (paymentComplete) {
        return (
            <View className="flex-1 bg-slate-50">
                {renderHeader('Payment Complete!')}
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                    <Text className="text-2xl font-bold text-emerald-600 mt-4 mb-2">
                        Payment Successful!
                    </Text>
                    <Text className="text-base text-slate-500 text-center mb-6 leading-tight">
                        Your payment of ₱{parseFloat(params.amount || '0').toLocaleString('en-PH')} has been processed successfully.
                    </Text>
                    <TouchableOpacity
                        className="bg-emerald-500 px-8 py-4 rounded-xl"
                        onPress={handleCompletePayment}
                    >
                        <Text className="text-white text-base font-semibold">View Receipt</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {renderHeader(`Pay with ${params.methodName}`)}
            <View className="flex-1 p-4">
                <View className="bg-white rounded-2xl p-5 mb-5 shadow-md">
                    <Text className="text-lg font-semibold text-slate-800 mb-1">
                        {params.title}
                    </Text>
                    <Text className="text-sm text-slate-500 mb-4">
                        {params.description || 'Payment Request'}
                    </Text>
                    <View className="flex-row items-center justify-center">
                        <Text className="text-base text-indigo-500 mr-1">
                            {params.currency === 'PHP' ? '₱' : params.currency}
                        </Text>
                        <Text className="text-2xl font-bold text-slate-800">
                            {parseFloat(params.amount || '0').toLocaleString('en-PH')}
                        </Text>
                    </View>
                </View>

                <View className="bg-white rounded-xl p-4 mb-6 flex-row items-center shadow-sm">
                    <View className="mr-4 w-12 h-12 rounded-full bg-sky-50 justify-center items-center">
                        <Ionicons
                            name={params.selectedMethod === 'gcash' ? 'logo-gcash' : 'wallet'}
                            size={48}
                            color="#6366F1"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-800 mb-1">
                            {params.methodName}
                        </Text>
                        <Text className="text-sm text-slate-500">Secure payment processing</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
                </View>

                <TouchableOpacity
                    className={`bg-indigo-500 p-4 rounded-xl items-center ${loading ? 'opacity-50' : ''}`}
                    onPress={handlePayment}
                    disabled={loading}
                >
                    <Text className="text-white text-lg font-semibold">
                        {loading ? 'Processing...' : `Pay ₱${parseFloat(params.amount || '0').toLocaleString('en-PH')}`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WalletPayScreen;
