import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

const App = () => {
  const router = useRouter();
  const handleAdmin = () => {
    // router.push("/admin");
  };
  const handleMember = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <View className="flex-1 justify-between">
        <View className="items-center mt-32">
          <Text className="text-2xl font-bold">LOGO</Text>
        </View>
        <View className="p-4 bottom-32 w-full gap-3 justify-around">
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg"
            onPress={() => {
              handleAdmin();
            }}
            activeOpacity={0.6}
          >
            <Text className="text-white text-center">ADMIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg"
            onPress={() => {
              handleMember();
            }}
            activeOpacity={0.6}
          >
            <Text className="text-white text-center">MEMBER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;
