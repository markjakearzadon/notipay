import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MemberList = () => {
  const randomdata = [
    { name: "Emma Thompson", phone: "555-0123-4567" },
    { name: "Liam Carter", phone: "555-9876-5432" },
    { name: "Sophia Nguyen", phone: "555-2345-6789" },
    { name: "Noah Patel", phone: "555-3456-7890" },
    { name: "Ava Rodriguez", phone: "555-4567-8901" },
  ];

  const renderItem = ({ item }: { item: { name: string; phone: string } }) => (
    <View className="p-4 m-2 bg-gray-100 rounded-lg border border-gray-200">
      <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
      <Text className="text-base text-gray-600">{item.phone}</Text>
    </View>
  );

  return (
    <SafeAreaView className="h-screen w-full bg-white">
      <FlatList
        data={randomdata}
        renderItem={renderItem}
        keyExtractor={(item) => item.phone}
        className="px-4"
      />
    </SafeAreaView>
  );
};

export default MemberList;
