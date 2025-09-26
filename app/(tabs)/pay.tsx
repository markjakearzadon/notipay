import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { paymentNoticeApi } from '../../services/api';

interface RouteParams {
    noticeId: string;
    title: string;
    amount: string;
    currency: string;
    description?: string;
    paymentUrl?: string;
}

const PayScreen = () => {
    const params = useLocalSearchParams() as unknown as RouteParams;
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'gcash' | 'paymaya' | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('PayScreen opened with params:', params);
    }, [params]);

    const paymentMethods = [
        {
            id: 'gcash' as const,
            name: 'GCash',
            icon: require('../../assets/images/gcash.png'),
            color: '#00D4AA',
            description: 'Fast & secure mobile wallet',
            channelCode: 'PH_GCASH',
        },
        {
            id: 'paymaya' as const,
            name: 'PayMaya',
            icon: require('../../assets/images/maya.png'),
            color: '#00A3E0',
            description: 'Maya digital wallet',
            channelCode: 'PH_MAYA',
        },
    ];

    const handleMethodSelect = async (method: typeof paymentMethods[0]) => {
        setSelectedMethod(method.id);
        setLoading(true);

        const walletUrl = `${params.paymentUrl}?channel=${method.channelCode}`;

        try {
            // Simulate redirection to wallet (in a real app, this would open the payment URL)
            setTimeout(async () => {
                try {
                    // After redirection, mark the payment as paid
                    const currentTime = new Date().toISOString();
                    await paymentNoticeApi.updatePaymentStatus(params.noticeId, {
                        status: 1, // 1 = Paid
                        paidAt: currentTime,
                    });

                    // Navigate back to payment list with success message
                    Alert.alert('Success', 'Payment completed successfully', [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]);
                } catch (error) {
                    Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process payment');
                } finally {
                    setLoading(false);
                }
            }, 800);

            // Navigate to wallet page (simulated)
            router.push({
                pathname: '/wallet',
                params: {
                    ...params,
                    paymentUrl: walletUrl,
                    selectedMethod: method.id,
                    methodName: method.name,
                } as any,
            });
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to initiate payment');
        }
    };

    const handleBack = () => {
        Alert.alert('Cancel Payment', 'Are you sure you want to cancel this payment?', [
            { text: 'Continue Payment', style: 'cancel' },
            {
                text: 'Cancel',
                style: 'destructive',
                onPress: () => router.back(),
            },
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50">
                <View className="bg-indigo-500 pt-12 pb-5 px-4 flex-row items-center shadow-md">
                    <TouchableOpacity onPress={handleBack} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-white flex-1 text-center">
                        Secure Payment
                    </Text>
                    <View className="w-6" />
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text className="mt-4 text-base text-slate-500 font-medium">
                        Redirecting to {selectedMethod}...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-500 pt-12 pb-5 px-4 flex-row items-center shadow-md">
                <TouchableOpacity onPress={handleBack} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-white flex-1 text-center">
                    Choose Payment Method
                </Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Payment Summary Card */}
                <View className="bg-white rounded-xl m-4 p-5 shadow">
                    <View className="flex-row items-start mb-4">
                        <View className="flex-1 mr-3">
                            <Text className="text-lg font-semibold text-slate-800 mb-1">
                                {params.title}
                            </Text>
                            {params.description && (
                                <Text className="text-sm text-slate-500" numberOfLines={1}>
                                    {params.description}
                                </Text>
                            )}
                        </View>
                        <View className="bg-amber-100 flex-row items-center px-3 py-1.5 rounded-full">
                            <Ionicons name="time-outline" size={16} color="#F59E0B" />
                            <Text className="text-xs font-semibold text-amber-800 ml-1">Pending</Text>
                        </View>
                    </View>

                    {/* Amount */}
                    <View className="items-center mb-6 pt-4 border-t border-slate-200">
                        <Text className="text-sm text-slate-500 mb-2">Total Amount</Text>
                        <View className="items-center">
                            <Text className="text-lg text-indigo-500 mb-1">
                                {params.currency === 'PHP' ? '₱' : params.currency}
                            </Text>
                            <Text className="text-3xl font-bold text-slate-800">
                                {parseFloat(params.amount || '0').toLocaleString('en-PH')}
                            </Text>
                        </View>
                    </View>

                    {/* Security Badge */}
                    <View className="flex-row items-center justify-center bg-sky-50 p-3 rounded-lg border border-sky-500">
                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                        <Text className="text-sm text-sky-700 ml-2 font-medium">
                            Protected by SSL encryption
                        </Text>
                    </View>
                </View>

                {/* Payment Methods Selection */}
                <View className="bg-white rounded-xl m-4 p-5 shadow">
                    <Text className="text-xl font-bold text-slate-800 mb-3 text-center">
                        Select Payment Method
                    </Text>

                    {paymentMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                            <TouchableOpacity
                                key={method.id}
                                className={`flex-row items-center rounded-lg p-4 mb-3 border ${
                                    isSelected
                                        ? 'bg-sky-50 border-sky-500 shadow'
                                        : 'bg-slate-50 border-slate-200'
                                }`}
                                onPress={() => handleMethodSelect(method)}
                                activeOpacity={0.9}
                            >
                                <View className="mr-4 w-16 h-16 justify-center items-center">
                                    <Image
                                        source={method.icon}
                                        className="w-12 h-12 rounded-full"
                                        resizeMode="contain"
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text
                                        className={`text-lg font-semibold ${
                                            isSelected ? 'text-sky-500' : 'text-slate-800'
                                        }`}
                                    >
                                        {method.name}
                                    </Text>
                                    <Text className="text-sm text-slate-500">{method.description}</Text>
                                    {isSelected && (
                                        <Text className="text-xs mt-1 font-medium text-sky-500">
                                            ✓ Selected payment method
                                        </Text>
                                    )}
                                </View>

                                <View className="w-6 items-center">
                                    {isSelected ? (
                                        <View className="w-6 h-6 rounded-full border-2 justify-center items-center border-sky-500 bg-sky-100">
                                            <Ionicons name="checkmark" size={16} color={method.color} />
                                        </View>
                                    ) : (
                                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* How It Works */}
                <View className="m-4 p-4 bg-slate-50 rounded-lg">
                    <Text className="text-base font-semibold text-slate-800 mb-3">
                        How it works
                    </Text>
                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <View className="w-6 h-6 rounded-full bg-indigo-500 justify-center items-center mr-3">
                                <Text className="text-white text-xs font-bold">1</Text>
                            </View>
                            <Text className="text-sm text-slate-600 flex-1">
                                Choose your preferred wallet
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-6 h-6 rounded-full bg-indigo-500 justify-center items-center mr-3">
                                <Text className="text-white text-xs font-bold">2</Text>
                            </View>
                            <Text className="text-sm text-slate-600 flex-1">
                                Complete payment in the app
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-6 h-6 rounded-full bg-indigo-500 justify-center items-center mr-3">
                                <Text className="text-white text-xs font-bold">3</Text>
                            </View>
                            <Text className="text-sm text-slate-600 flex-1">
                                Receive instant confirmation
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default PayScreen;
