import React, { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

interface User {
  id: number;
  userName: string;
  role: string;
}

const API_URL = "http://192.168.254.132:5113/api/auth/members";

const MemberList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        Alert.alert("Error", "No access token found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const renderItem = ({ item }: { item: User }) => (
    <View className="p-4 m-2 bg-gray-100 rounded-lg border border-gray-200">
      <Text className="text-lg font-semibold text-gray-800">{item.userName}</Text>
      <Text className="text-base text-gray-600">{item.role}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="h-screen w-full justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-screen w-full bg-white">
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        className="px-4"
      />
    </SafeAreaView>
  );
};

export default MemberList;
