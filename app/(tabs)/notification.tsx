import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const notification = () => {
  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <ScrollView className="flex-1">
        <View>
          <Text></Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default notification;
