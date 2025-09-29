import React, { useState } from "react";
import { 
    Text, 
    TouchableOpacity, 
    View, 
    StyleSheet, 
    ImageBackground, 
    TextInput, 
    Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import background from "../assets/images/backburner.jpeg";
import { useRouter } from "expo-router";
import axios from "axios";

const SetSchoolYear = () => {
    const router = useRouter();
    const [newDate, setNewDate] = useState("");

    const handleSubmit = async () => {
        if (!newDate) {
            Alert.alert("Error", "Please enter the new date.");
            return;
        }

        try {
            const response = await axios.patch(
                "https://notipaygobackend.onrender.com/api/date",
                {
                    date: newDate, // must be in "YYYY-MM-DD"
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${/* Replace with your token logic */ "your-jwt-token"}`,
                    },
                }
            );

            Alert.alert("Success", response.data.message);
            setNewDate("");
            router.push("/admindashboard");
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.error || "Failed to update date.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ImageBackground 
                source={background} 
                style={styles.image}
                resizeMode="cover"
            >
                <View className="flex-1 bg-black/60">
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 mt-4">
                        <TouchableOpacity onPress={() => router.push("/admindashboard")}>
                            <Ionicons name="arrow-back" size={26} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Set Server Date</Text>
                        <View className="w-10 h-10" />
                    </View>

                    {/* Form */}
                    <View className="flex-1 px-10 mt-12 items-center">
                        <View className="w-full max-w-md">
                            <Text className="text-white font-semibold mb-2">New Date</Text>
                            <TextInput
                                className="w-full h-12 bg-white/90 rounded-lg px-4 mb-6 text-black"
                                placeholder="e.g., 2030-01-02"
                                value={newDate}
                                onChangeText={setNewDate}
                            />

                            <TouchableOpacity
                                className="w-full h-12 bg-purple-600 rounded-lg justify-center items-center"
                                onPress={handleSubmit}
                            >
                                <Text className="text-white font-semibold">Update Date</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default SetSchoolYear;

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
    },
});
