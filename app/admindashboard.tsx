import React from "react";
import { Text, TouchableOpacity, View, StyleSheet, ImageBackground, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import background from "../assets/images/backburner.jpeg";
import Anunsyo from "@/assets/images/bullhorn-solid-full.png";
import ListahanNgMgaGago from "@/assets/images/receipt-solid-full.png";
import DalawangTao from "@/assets/images/user-group-solid-full.png";
import { useRouter } from "expo-router";

const admindashboard = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ImageBackground 
                source={background} 
                style={styles.image}
                resizeMode="cover"
            >
                {/* Overlay for readability */}
                <View className="flex-1 bg-black/60">
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 mt-4">
                        <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center">
                            <Text className="text-white font-bold">U</Text>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="settings-outline" size={26} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Logo / Title */}
                    <View className="mt-12 mb-10 items-center">
                        <Text className="text-3xl font-extrabold text-white">
                            Noti<Text className="text-yellow-400">Pay</Text>
                        </Text>
                    </View>

                    <View className="flex-1 px-10 space-y-6">
                        <View className="justify-center items-center gap-2 mb-8">
                            <TouchableOpacity
                                className="w-32 h-32 bg-deepblue rounded-lg justify-center items-center"
                                onPress={() => router.push("/memberlist")}
                            >
                                <Image source={DalawangTao} className="w-16 h-16" />
                            </TouchableOpacity>
                            <Text className="text-center text-white">MEMBERSHIP LIST</Text>
                        </View>

                        <View className="justify-center items-center gap-2 mb-8">
                            <TouchableOpacity
                                className="w-32 h-32 bg-green-50 rounded-lg justify-center items-center"
                                onPress={() => router.push("/paymentlist")}
                            >
                                <Image source={ListahanNgMgaGago} className="w-16 h-16" />
                            </TouchableOpacity>
                            <Text className="text-white">PAYMENT LIST</Text>
                        </View>

                        <View className="justify-center items-center gap-2 mb-8">
                            <TouchableOpacity
                                className="w-32 h-32 bg-yellow-50 rounded-lg justify-center items-center"
                                onPress={() => router.push("/createannouncement")}
                            >
                                <Image source={Anunsyo} className="w-16 h-16" />
                            </TouchableOpacity>
                            <Text className="text-white">ANNOUNCEMENT</Text>
                        </View>
                    </View>

                    {/* Create School Year Button in Bottom Right */}
                    <View style={styles.bottomRightButton}>
                        <TouchableOpacity
                            className="w-32 h-10 bg-purple-600 rounded-lg justify-center items-center"
                            onPress={() => router.push("/setyear")}
                        >
                            <Text className="text-white font-semibold text-[10px]">SET YEAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default admindashboard;

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
    },
    bottomRightButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
    },
});
