import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    StyleSheet
} from "react-native";
import title from "../assets/images/title.png";
import { SafeAreaView } from "react-native-safe-area-context";

const admin = () => {
    const [pin, setPin] = useState<string>("");
    const router = useRouter();
    return (
	<SafeAreaView className="h-screen w-screen bg-white">
	    <ScrollView className="flex-1">
                <View className="items-center">
		    <Image
                        source={title}
                        style={styles.title}
		    />

		</View>
		<View className="p-4 mt-20 w-full gap-3 justify-around">
		    <Text className="text-lg text-center font-bold">Admin Login</Text>
		    <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
			<Text>PIN:</Text>
			<TextInput
			    className="ml-2 flex-1"
				       placeholder="Enter PIN"
				       keyboardType="numeric"
				       value={pin}
				       onChangeText={setPin}
				       secureTextEntry
			/>
		    </View>
		    <TouchableOpacity
			className="bg-blue-500 p-4 rounded-lg mt-4"
			onPress={() => {
			    router.push("/admindashboard");
			}}
		    >
			<Text className="text-white text-center">Continue</Text>
		    </TouchableOpacity>
		</View>
	    </ScrollView>
	</SafeAreaView>
    );
};

export default admin;
const styles = StyleSheet.create({
    title: {
        width: 200,
        height: 200,
        justifyContent: "center",
    }
    
});
