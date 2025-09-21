import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
    noticeId: string;
    title: string;
    amount: string;
    currency: string;
    description?: string;
    paymentUrl?: string;
}

const PayScreen = () => {
    const params = useLocalSearchParams<RouteParams>();
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'gcash' | 'paymaya' | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('💳 PayScreen opened with params:', params);
    }, [params]);

    const paymentMethods = [
        {
            id: 'gcash' as const,
            name: 'GCash',
            icon: require('../../assets/images/gcash.png'), // ✅ Your PNG icon
            color: '#00D4AA',
            description: 'Fast & secure mobile wallet',
            channelCode: 'PH_GCASH',
        },
        {
            id: 'paymaya' as const,
            name: 'PayMaya',
            icon: require('../../assets/images/maya.png'), // ✅ Your PNG icon
            color: '#00A3E0',
            description: 'Maya digital wallet',
            channelCode: 'PH_MAYA',
        },
    ];

    const handleMethodSelect = (method: typeof paymentMethods[0]) => {
        setSelectedMethod(method.id);
        setLoading(true);

        // Generate wallet-specific payment URL or redirect to Xendit with channel parameter
        const walletUrl = `${params.paymentUrl}?channel=${method.channelCode}`;
        
        setTimeout(() => {
            setLoading(false);
            router.push({
                pathname: '/pay/wallet',
                params: { 
                    ...params,
                    paymentUrl: walletUrl,
                    selectedMethod: method.id,
                    methodName: method.name,
                } as any,
            });
        }, 800); // Small delay for smooth transition
    };

    const handleBack = () => {
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Secure Payment</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Redirecting to {selectedMethod}...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose Payment Method</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Payment Summary Card */}
                <View style={styles.paymentCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.leftContent}>
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {params.title}
                            </Text>
                            {params.description && (
                                <Text style={styles.cardDescription} numberOfLines={1}>
                                    {params.description}
                                </Text>
                            )}
                        </View>
                        <View style={styles.statusIndicator}>
                            <Ionicons name="time-outline" size={16} color="#F59E0B" />
                            <Text style={styles.statusText}>Pending</Text>
                        </View>
                    </View>

                    {/* Amount */}
                    <View style={styles.amountSection}>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>
                                {params.currency === 'PHP' ? '₱' : params.currency}
                            </Text>
                            <Text style={styles.amountValue}>
                                {parseFloat(params.amount || '0').toLocaleString('en-PH')}
                            </Text>
                        </View>
                    </View>

                    {/* Security Badge */}
                    <View style={styles.securityBadge}>
                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                        <Text style={styles.securityText}>Protected by SSL encryption</Text>
                    </View>
                </View>

                {/* Payment Methods Selection */}
                <View style={styles.methodsContainer}>
                    <Text style={styles.methodsTitle}>Select Payment Method</Text>
                    
                    {paymentMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        
                        return (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.methodCard,
                                    isSelected && styles.methodCardSelected
                                ]}
                                onPress={() => handleMethodSelect(method)}
                                activeOpacity={0.9}
                            >
                                {/* ✅ PNG Icon */}
                                <View style={styles.methodIconContainer}>
                                    <Image 
                                        source={method.icon} 
                                        style={[
                                            styles.methodIcon, 
                                            isSelected && { 
                                                borderWidth: 3, 
                                                borderColor: method.color,
                                                shadowColor: method.color + '40',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 4,
                                            }
                                        ]} 
                                        resizeMode="contain"
                                    />
                                </View>
                                
                                <View style={styles.methodInfo}>
                                    <Text style={[
                                        styles.methodName, 
                                        isSelected && { color: method.color }
                                    ]}>
                                        {method.name}
                                    </Text>
                                    <Text style={styles.methodDescription}>
                                        {method.description}
                                    </Text>
                                    {isSelected && (
                                        <Text style={[styles.methodSelected, { color: method.color }]}>
                                            ✓ Selected payment method
                                        </Text>
                                    )}
                                </View>
                                
                                <View style={styles.methodRight}>
                                    {isSelected ? (
                                        <View style={[styles.checkmark, { 
                                            backgroundColor: method.color + '20',
                                            borderColor: method.color 
                                        }]}>
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
                <View style={styles.howItWorks}>
                    <Text style={styles.howItWorksTitle}>How it works</Text>
                    <View style={styles.stepsContainer}>
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>1</View>
                            <Text style={styles.stepText}>Choose your preferred wallet</Text>
                        </View>
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>2</View>
                            <Text style={styles.stepText}>Complete payment in the app</Text>
                        </View>
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>3</View>
                            <Text style={styles.stepText}>Receive instant confirmation</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        paddingTop: 50,
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
    scrollView: {
        flex: 1,
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    leftContent: {
        flex: 1,
        marginRight: 12,
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
        marginBottom: 8,
    },
    statusIndicator: {
        backgroundColor: '#FEF3C7',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
        marginLeft: 4,
    },
    amountSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    amountLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    amountContainer: {
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 16,
        color: '#6366F1',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F9FF',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0EA5E9',
    },
    securityText: {
        fontSize: 14,
        color: '#0369A1',
        marginLeft: 8,
        fontWeight: '500',
    },
    methodsContainer: {
        margin: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    methodsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    methodCardSelected: {
        backgroundColor: '#F0F9FF',
        borderColor: '#0EA5E9',
        borderWidth: 2,
        shadowColor: '#0EA5E920',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    methodIconContainer: {
        marginRight: 16,
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    methodDescription: {
        fontSize: 14,
        color: '#64748B',
    },
    methodSelected: {
        fontSize: 12,
        color: '#0EA5E9',
        marginTop: 4,
        fontWeight: '500',
    },
    methodRight: {
        width: 24,
        alignItems: 'center',
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    howItWorks: {
        margin: 16,
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    howItWorksTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 12,
    },
    stepsContainer: {
        gap: 12,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepNumber: {
        backgroundColor: '#6366F1',
        color: 'white',
        width: 24,
        height: 24,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 12,
    },
    stepText: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingContent: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
});

export default PayScreen;
