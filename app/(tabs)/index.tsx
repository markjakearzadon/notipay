import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <ScrollView className="flex-1">
        <View>
          <Text>index</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
