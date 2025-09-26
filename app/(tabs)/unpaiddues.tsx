// app/screens/UnpaidDues.tsx
import React, { useState, useEffect } from "react";
import { 
    ScrollView, 
    Text, 
    View, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    RefreshControl 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { paymentNoticeApi, PaymentNotice, mapStatusToDisplay } from "../../services/api";

const UnpaidDues = () => {
    const [dues, setDues] = useState<PaymentNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
	loadUnpaidDues();
    }, []);

    const loadUnpaidDues = async () => {
	try {
	    setLoading(true);
	    const result = await paymentNoticeApi.getMyUnpaidDues();
	    setDues(result || []);
	} catch (err) {
	    console.error("Load unpaid dues error:", err);
	    Alert.alert("Error", "Network error. Please try again.");
	} finally {
	    setLoading(false);
	}
    };

    const handleRefresh = async () => {
	setRefreshing(true);
	await loadUnpaidDues();
	setRefreshing(false);
    };

    const handlePay = (notice: PaymentNotice) => {
	Alert.alert(
	    "Confirm Payment",
	    `Pay ₱${notice.amount.toLocaleString("en-PH")} for "${notice.title}"?`,
	    [
		{ text: "Cancel", style: "cancel" },
		{
		    text: "Pay Now",
		    style: "destructive",
		    onPress: () =>
			router.push({
			    pathname: "/pay",
			    params: {
				noticeId: notice.id,
				title: notice.title,
				amount: notice.amount.toString(),
				currency: notice.currency,
				description: notice.description || "",
				paymentUrl: notice.xenditPaymentLinkUrl || "",
			    },
			}),
		},
	    ]
	);
    };

    const formatAmount = (amount: number, currency: string) => {
	return `${currency === "PHP" ? "₱" : currency} ${amount.toLocaleString("en-PH")}`;
    };

    const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-PH", {
	    year: "numeric",
	    month: "short",
	    day: "numeric",
	});
    };

    if (loading) {
	return (
	    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
		<ActivityIndicator size="large" color="#6366F1" />
		<Text className="mt-4 text-slate-500 font-medium">Loading your unpaid dues...</Text>
	    </SafeAreaView>
	);
    }

    return (
	<SafeAreaView className="flex-1 bg-slate-50">
	    {/* Header */}
	    <View className="bg-indigo-500 px-5 py-6 items-center">
		<Text className="text-white text-2xl font-bold mb-2">Unpaid Dues</Text>
		<Text className="text-indigo-100">{dues.length} pending</Text>
	    </View>

	    {/* List */}
	    <ScrollView
		className="flex-1"
			   refreshControl={
			       <RefreshControl
				   refreshing={refreshing}
					      onRefresh={handleRefresh}
					      colors={["#6366F1"]}
					      tintColor="#6366F1"
			       />
			   }
			   showsVerticalScrollIndicator={false}
	    >
		{dues.length === 0 ? (
		    <View className="flex-1 items-center justify-center py-20">
			<Ionicons name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
			<Text className="text-lg font-semibold text-slate-500 mt-4">No unpaid dues 🎉</Text>
			<Text className="text-slate-400 text-center mt-2 px-6">
			    All your payments are up to date.
			</Text>
		    </View>
		) : (
		    <View className="px-4 py-4">
			{dues.map((item) => (
			    <TouchableOpacity
				key={item.id}
				    className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-200"
				    activeOpacity={0.95}
				    onPress={() => handlePay(item)}
			    >
				{/* Title & Description */}
				<View className="mb-2">
				    <Text className="text-base font-semibold text-slate-800" numberOfLines={1}>
					{item.title}
				    </Text>
				    {item.description && (
					<Text className="text-sm text-slate-500" numberOfLines={1}>
					    {item.description}
					</Text>
				    )}
				    <Text className="text-xs text-slate-400 mt-1">{formatDate(item.createdAt)}</Text>
				</View>

				{/* Amount & Pay button */}
				<View className="flex-row justify-between items-center">
				    <Text className="text-lg font-bold text-slate-900">
					{formatAmount(item.amount, item.currency)}
				    </Text>
				    <TouchableOpacity
					className="bg-indigo-500 px-4 py-2 rounded-lg"
						   onPress={() => handlePay(item)}
				    >
					<Text className="text-white font-semibold text-sm">Pay Now</Text>
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

export default UnpaidDues;
