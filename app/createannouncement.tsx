import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const createannouncement = () => {
  return (
    <SafeAreaView className="h-screen w-screen bg-white">
      <View className="flex-1 items-center justify-center">
        <View className="flex-1 w-full px-5 mt-8">
          <Text className="text-lg text-gray-800 mb-4">Title</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            placeholder="Enter announcement title"
          />
          <Text className="text-lg text-gray-800 mb-4">Content</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 h-32"
            placeholder="Enter announcement content"
            multiline
          />
          <TouchableOpacity className="bg-blue-500 px-3 py-2 rounded-md">
            <Text className="text-white text-center">Create Announcement</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default createannouncement;
