import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    title: `Payment request #${i + 1}`,
    date: new Date(2025, 7, (i % 30) + 1), // August (month 7 since it's 0-indexed)
    status: i % 3 === 0 ? "paid" : i % 3 === 1 ? "pending" : "unpaid",
  }));

  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <View className="p-4 mt-10 w-full gap-3 justify-around">
        <Text className="text-2xl font-bold text-center">
          {"{user}"}'s summary of payments
        </Text>
        <View className="flex-row justify-around w-full">
          <Text>Title</Text>
          <Text>Date & Time</Text>
          <Text>Status</Text>
        </View>
        <ScrollView
          className="max-h-screen-safe"
          showsVerticalScrollIndicator={false}
        >
          {data.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-around w-full p-3 rounded-2xl  bg-slate-300 border border-slate-800 mb-1"
            >
              <Text
                className="flex-1 text-left text-ellipsis"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
              <Text className="flex-1 text-center">
                {item.date.toLocaleDateString()}
              </Text>
              <Text className="flex-1 text-right">{item.status}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;
