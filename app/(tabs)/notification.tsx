import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_BASE_URL = "https://notipaygobackend-ev1s.onrender.com";

const notification = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/announcements`);
        setAnnouncements(response.data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch announcements: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <ScrollView className="flex-1">
        <View className="px-5 py-8">
          <Text className="text-2xl font-bold text-gray-800 mb-6">Announcements</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : announcements.length === 0 ? (
            <Text className="text-center text-gray-600">No announcements available</Text>
          ) : (
            announcements.map((announcement) => (
              <View
                key={announcement.id}
                className="border border-gray-300 rounded-md p-4 mb-4 bg-white shadow-sm"
              >
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  {announcement.title}
                </Text>
                <Text className="text-gray-600 mb-2">{announcement.content}</Text>
                <Text className="text-sm text-gray-400">
                  Posted on: {new Date(announcement.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default notification;
