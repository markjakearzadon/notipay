import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Test data
const testData = [
  { name: "John Smith", isPending: true },
  { name: "Emma Johnson", isPending: false },
  { name: "Michael Chen", isPending: true },
  { name: "Sarah Davis", isPending: false },
  { name: "Liam Brown", isPending: true },
  { name: "Olivia Wilson", isPending: false },
  { name: "Noah Martinez", isPending: true },
  { name: "Ava Taylor", isPending: false },
  { name: "William Lee", isPending: true },
  { name: "Sophia Clark", isPending: false },
];

const Payments = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [payments, setPayments] = useState(testData); // State to manage payment data
  const segments = ["Paid", "Unpaid"];

  // Filter data based on selectedIndex
  const filteredData = payments.filter((item) =>
    selectedIndex === 0 ? !item.isPending : item.isPending
  );

  // Function to toggle payment status
  const togglePaymentStatus = (index: number) => {
    setPayments((prevPayments) =>
      prevPayments.map((item, i) =>
        i === index ? { ...item, isPending: !item.isPending } : item
      )
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center mt-8">
        <Text className="text-2xl font-bold text-black">LOGO</Text>
        <Text className="text-2xl font-bold text-black mt-2">Payment List</Text>
        <SegmentedControl
          values={segments}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          style={{ width: 200, marginTop: 20 }}
          appearance="light"
          fontStyle={{ fontSize: 16 }}
          activeFontStyle={{ fontWeight: "bold" }}
        />
      </View>
      <View className="flex-1 w-full px-5 mt-8">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <View
                key={`${item.name}-${index}`}
                className="flex-row justify-between items-center p-4 border-b border-gray-200"
              >
                <View className="flex-1">
                  <Text className="text-lg text-gray-800">{item.name}</Text>
                </View>
                <TouchableOpacity
                  className="bg-blue-500 px-3 py-2 rounded-md"
                  onPress={() =>
                    togglePaymentStatus(
                      payments.findIndex(
                        (p) =>
                          p.name === item.name && p.isPending === item.isPending
                      )
                    )
                  }
                >
                  <Text className="text-white text-sm font-semibold">
                    {item.isPending ? "Mark as Paid" : "Mark as Unpaid"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-base text-gray-600 text-center">
              No {selectedIndex === 0 ? "paid" : "unpaid"} payments found
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Payments;
