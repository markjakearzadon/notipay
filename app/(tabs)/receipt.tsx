import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentNotice } from '../../services/api';

const Receipt = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const paymentDetails: Partial<PaymentNotice> = {
	id: params.noticeId as string,
	title: params.title as string,
	amount: parseFloat(params.amount as string),
	currency: params.currency as string,
	description: params.description as string,
	createdAt: params.createdAt as string,
	paidAt: params.paidAt as string,
	status: parseInt(params.status as string),
	xenditPaymentLinkUrl: params.paymentUrl as string,
    };

    const formatAmount = (amount: number, currency: string) => {
	return `${currency === 'PHP' ? '₱' : currency} ${amount.toLocaleString('en-PH')}`;
    };

    const formatDate = (dateString: string) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleDateString('en-PH', {
	    year: 'numeric',
	    month: 'long',
	    day: 'numeric',
	    hour: '2-digit',
	    minute: '2-digit',
	});
    };

    return (
	<SafeAreaView style={styles.container}>
	    <View style={styles.header}>
		<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
		    <Ionicons name="arrow-back" size={24} color="white" />
		</TouchableOpacity>
		<Text style={styles.headerTitle}>Payment Receipt</Text>
	    </View>

	    <View style={styles.content}>
		<View style={styles.receiptCard}>
		    <View style={styles.iconContainer}>
			<Ionicons name="checkmark-circle" size={48} color="#10B981" />
		    </View>

		    <Text style={styles.title}>{paymentDetails.title}</Text>

		    <View style={styles.detailRow}>
			<Text style={styles.label}>Amount Paid</Text>
			<Text style={styles.value}>
			    {formatAmount(paymentDetails.amount || 0, paymentDetails.currency || 'PHP')}
			</Text>
		    </View>

		    {paymentDetails.description && (
			<View style={styles.detailRow}>
			    <Text style={styles.label}>Description</Text>
			    <Text style={styles.value}>{paymentDetails.description}</Text>
			</View>
		    )}

		    <View style={styles.detailRow}>
			<Text style={styles.label}>Payment Date</Text>
			<Text style={styles.value}>{formatDate(paymentDetails.paidAt || '')}</Text>
		    </View>

		    <View style={styles.detailRow}>
			<Text style={styles.label}>Transaction ID</Text>
			<Text style={styles.value}>{paymentDetails.id}</Text>
		    </View>

		    <View style={styles.detailRow}>
			<Text style={styles.label}>Created At</Text>
			<Text style={styles.value}>{formatDate(paymentDetails.createdAt || '')}</Text>
		    </View>

		    <View style={styles.statusBadge}>
			<Ionicons name="checkmark-circle" size={16} color="#10B981" />
			<Text style={styles.statusText}>Paid</Text>
		    </View>
		</View>

		<TouchableOpacity
		    style={styles.closeButton}
		    onPress={() => router.back()}
		>
		    <Text style={styles.closeButtonText}>Close</Text>
		</TouchableOpacity>
	    </View>
	</SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
	flex: 1,
	backgroundColor: '#F8FAFC',
    },
    header: {
	backgroundColor: '#6366F1',
	padding: 20,
	paddingTop: 10,
	flexDirection: 'row',
	alignItems: 'center',
    },
    backButton: {
	marginRight: 16,
    },
    headerTitle: {
	fontSize: 24,
	fontWeight: 'bold',
	color: 'white',
    },
    content: {
	flex: 1,
	padding: 16,
    },
    receiptCard: {
	backgroundColor: 'white',
	borderRadius: 16,
	padding: 20,
	marginBottom: 20,
	shadowColor: '#000',
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.1,
	shadowRadius: 4,
	elevation: 3,
	borderWidth: 1,
	borderColor: '#A7F3D0',
    },
    iconContainer: {
	alignItems: 'center',
	marginBottom: 20,
    },
    title: {
	fontSize: 20,
	fontWeight: 'bold',
	color: '#1E293B',
	textAlign: 'center',
	marginBottom: 20,
    },
    detailRow: {
	flexDirection: 'row',
	justifyContent: 'space-between',
	marginBottom: 16,
	borderBottomWidth: 1,
	borderBottomColor: '#E2E8F0',
	paddingBottom: 12,
    },
    label: {
	fontSize: 14,
	color: '#64748B',
	fontWeight: '500',
    },
    value: {
	fontSize: 14,
	color: '#1E293B',
	fontWeight: '600',
	maxWidth: '60%',
	textAlign: 'right',
    },
    statusBadge: {
	flexDirection: 'row',
	alignItems: 'center',
	backgroundColor: '#D1FAE5',
	paddingHorizontal: 12,
	paddingVertical: 6,
	borderRadius: 12,
	alignSelf: 'center',
	marginTop: 12,
    },
    statusText: {
	fontSize: 14,
	fontWeight: '600',
	color: '#10B981',
	marginLeft: 6,
    },
    closeButton: {
	backgroundColor: '#6366F1',
	padding: 16,
	borderRadius: 8,
	alignItems: 'center',
    },
    closeButtonText: {
	color: 'white',
	fontSize: 16,
	fontWeight: '600',
    },
});

export default Receipt;
