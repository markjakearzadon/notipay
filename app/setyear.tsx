import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ImageBackground, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import background from "../assets/images/backburner.jpeg";
import { useRouter } from "expo-router";
import axios from "axios";

const SetSchoolYear = () => {
    const router = useRouter();
    const [year, setYear] = useState("");
    const [startDate, setStartDate] = useState("");

    const handleSubmit = async () => {
        if (!year || !startDate) {
            Alert.alert("Error", "Please fill in both year and start date.");
            return;
        }

        try {
            const response = await axios.post(
                "http://your-api-base-url/api/auth/school-year",
                {
                    Year: year,
                    StartDate: startDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${/* Replace with your token logic */ "your-jwt-token"}`,
                    },
                }
            );

            Alert.alert("Success", response.data.message);
            setYear("");
            setStartDate("");
            router.push("/admindashboard");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.error || "Failed to set school year.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ImageBackground 
                source={background} 
                style={styles.image}
                resizeMode="cover"
            >
                {/* Overlay for readability */}
                <View className="flex-1 bg-black/60">
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 mt-4">
                        <TouchableOpacity onPress={() => router.push("/admindashboard")}>
                            <Ionicons name="arrow-back" size={26} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Set School Year</Text>
                        <View className="w-10 h-10" /> {/* Spacer for alignment */}
                    </View>

                    {/* Form */}
                    <View className="flex-1 px-10 mt-12 items-center">
                        <View className="w-full max-w-md">
                            <Text className="text-white font-semibold mb-2">School Year</Text>
                            <TextInput
                                className="w-full h-12 bg-white/90 rounded-lg px-4 mb-6 text-black"
                                placeholder="e.g., 2025-2026"
                                value={year}
                                onChangeText={setYear}
                            />

                            <Text className="text-white font-semibold mb-2">Start Date</Text>
                            <TextInput
                                className="w-full h-12 bg-white/90 rounded-lg px-4 mb-6 text-black"
                                placeholder="e.g., 2025-09-01"
                                value={startDate}
                                onChangeText={setStartDate}
                            />

                            <TouchableOpacity
                                className="w-full h-12 bg-purple-600 rounded-lg justify-center items-center"
                                onPress={handleSubmit}
                            >
                                <Text className="text-white font-semibold">Submit</Text>
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
