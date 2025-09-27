import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_BASE_URL = "https://notipaygobackend-ev1s.onrender.com/";

const createannouncement = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAnnouncement = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Please fill in both title and content");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/announcement`, {
        title,
        content,
      });
      Alert.alert("Success", "Announcement created successfully");
      // Reset form
      setTitle("");
      setContent("");
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data || "Failed to create announcement: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <View className="flex-1 items-center justify-center">
        <View className="flex-1 w-full px-5 mt-8">
          <Text className="text-lg text-gray-800 mb-4">Title</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            placeholder="Enter announcement title"
            value={title}
            onChangeText={setTitle}
          />
          <Text className="text-lg text-gray-800 mb-4">Content</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 h-32"
            placeholder="Enter announcement content"
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TouchableOpacity
            className="bg-deepblue px-3 py-3 rounded-md"
            onPress={handleCreateAnnouncement}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-center">Create Announcement</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default createannouncement;
