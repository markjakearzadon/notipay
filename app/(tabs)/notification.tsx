import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_BASE_URL = "https://notipaygobackend-ev1s.onrender.com";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Notification = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const getPreview = (text) => {
    const maxChars = 100;
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars) + "...";
  };

  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <ScrollView className="flex-1">
        <View className="px-5 py-8">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Announcements
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : announcements.length === 0 ? (
            <Text className="text-center text-gray-600">
              No announcements available
            </Text>
          ) : (
            announcements.map((announcement) => {
              const isExpanded = expandedId === announcement.id;
              return (
                <TouchableOpacity
                  key={announcement.id}
                  onPress={() => toggleExpand(announcement.id)}
                  activeOpacity={0.8}
                >
                  <View className="border border-gray-300 rounded-md p-4 mb-4 bg-white shadow-sm">
                    {/* Title and Date Row */}
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-lg font-semibold text-gray-800 flex-1">
                        {announcement.title}
                      </Text>
                      <Text className="text-sm text-gray-400 ml-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Content */}
                    <Text className="text-gray-600 mb-2">
                      {isExpanded
                        ? announcement.content
                        : getPreview(announcement.content)}
                    </Text>

                    <Text className="text-blue-600 mt-2">
                      {isExpanded ? "Show less ▲" : "Read more ▼"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;

