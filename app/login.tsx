import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import title from "../assets/images/title.png";

const login = () => {
    const router = useRouter();
    const [number, setNumber] = useState("");
    const handleLogin = () => {
	router.push("/(tabs)");
    };
    const handleRegister = () => {
	router.push("/register");
    };

    return (
	<SafeAreaView className="h-full w-screen bg-white">
	    <ScrollView className="flex-1"
				   showsVerticalScrollIndicator={false}
	    >
		<View className="items-center">
		    <Image
                        source={title}
                        style={styles.title}
		    />
                </View>
		<View className="p-4 mt-20 w-full gap-3 justify-around">
		    <Text className="text-lg font-bold">Login</Text>
		    <Text className="text-sm text-gray-500">
			Enter your phone number to continue
		    </Text>
		    <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
			<Text>+63</Text>
			<TextInput
			    className="ml-2 flex-1"
			    placeholder="Phone Number"
			    keyboardType="phone-pad"
			    value={number}
			    onChangeText={setNumber}
			/>
		    </View>
		    <TouchableOpacity
			className="bg-blue-500 p-4 rounded-lg mt-4"
			onPress={() => handleLogin()}
		    >
			<Text className="text-white text-center">Continue</Text>
		    </TouchableOpacity>
		    <Text className="text-sm text-gray-500 text-center mt-2">
			Don't have an account?{" "}
			<Text className="text-blue-500" onPress={() => handleRegister()}>
			    Register here
			</Text>
		    </Text>
		</View>
	    </ScrollView>
	</SafeAreaView>
    );
};

export default login;
const styles = StyleSheet.create({
    title: {
        width: 200,
        height: 200,
        justifyContent: "center",
    }
});
