import { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    StyleSheet,
} from "react-native";
import title from "../assets/images/title.png";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const register = () => {
    const router = useRouter();
    const [number, setNumber] = useState("");
    const [fullname, setFullname] = useState("");
    const [password, setPassword] = useState("");
    const handleRegister = () => {};

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
		<View className="p-4 mt-4 w-full gap-3 justify-around">
		    <Text className="text-lg font-bold">Register</Text>
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
		    <View className="border border-gray-300 rounded-lg p-4">
			<TextInput
			    className="ml-2 flex-1"
			    placeholder="Full Name"
			    value={fullname}
			    onChangeText={setFullname}
			/>
		    </View>
		    <View className="border border-gray-300 rounded-lg p-4">
			<TextInput
			    className="ml-2 flex-1"
			    placeholder="Password"
			    secureTextEntry
			    value={password}
			    onChangeText={setPassword}
			/>
		    </View>
		    <TouchableOpacity
			className="bg-blue-500 p-4 rounded-lg mt-4"
			onPress={() => {
			    // Handle register action
			}}
		    >
			<Text className="text-white text-center">Continue</Text>
		    </TouchableOpacity>
		    {/* already have an account? */}
		    <Text className="text-sm text-gray-500 text-center mt-2">
			Already have an account?{" "}
			<Text
			    className="text-blue-500"
			    onPress={() => router.push("/login")}
			>
			    Login here
			</Text>
		    </Text>
		    {/* terms and policy */}
		    <Text className="text-sm text-gray-500 text-center mt-4">
			{/* By continuing, you agree to our Terms of Service and Privacy Policy. */}
			Sa pagpapatuloy, sumasang-ayon ka sa aming Mga{" "}
			<Text
			    className="text-blue-500"
			    onPress={() => router.push("/kambagelan")}
			>
			    Tuntunin ng Serbisyo
			</Text>{" "}
			at{" "}
			<Text
			    className="text-blue-500"
			    onPress={() => router.push("/kambagelan")}
			>
			    Patakaran sa Privacy.
			</Text>
		    </Text>
		</View>
	    </ScrollView>
	</SafeAreaView>
    );
};

export default register;
const styles = StyleSheet.create({
    title: {
        width: 200,
        height: 200,
        justifyContent: "center",
    }
});
