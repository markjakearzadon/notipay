import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Anunsyo from "@/assets/images/bullhorn-solid-full.png";
import ListahanNgMgaGago from "@/assets/images/receipt-solid-full.png";
import DalawangTao from "@/assets/images/user-group-solid-full.png";
import { useRouter } from "expo-router";

const admindashboard = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <View className="flex-1 justify-between">
        <View className="h-screen w-screen bg-white flex-1 justify-center items-center p-4">
          <View className="justify-center items-center gap-2 mb-8">
            <TouchableOpacity className="w-32 h-32 bg-blue-50 rounded-lg justify-center items-center">
              <Image source={DalawangTao} className="w-16 h-16" />
            </TouchableOpacity>
            <Text className="text-center">MEMBERSHIP LIST</Text>
          </View>

          <View className="justify-center items-center gap-2 mb-8">
            <TouchableOpacity
              className="w-32 h-32 bg-green-50 rounded-lg justify-center items-center"
              onPress={() => router.push("/paymentlist")}
            >
              <Image source={ListahanNgMgaGago} className="w-16 h-16" />
            </TouchableOpacity>
            <Text>PAYMENT LIST</Text>
          </View>
          <View className="justify-center items-center gap-2">
            <TouchableOpacity
              className="w-32 h-32 bg-yellow-50 rounded-lg justify-center items-center"
              onPress={() => router.push("/createannouncement")}
            >
              <Image source={Anunsyo} className="w-16 h-16" />
            </TouchableOpacity>
            <Text>ANNOUNCEMENT</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default admindashboard;
