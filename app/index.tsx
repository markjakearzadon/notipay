import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View, ImageBackground, StyleSheet, Image } from "react-native";
import background from "../assets/images/backburner.jpeg";
import title from "../assets/images/title.png";

const App = () => {
    const router = useRouter();
    const handleAdmin = () => {
	router.push("/admin");
    };
    const handleMember = () => {
	router.push("/login");
    };

    return (
	<SafeAreaView className="flex-1 bg-deepblue">
	    <ImageBackground 
                source={background} 
                style={styles.image}
                resizeMode="cover"
            >
	        <View className="flex-1 justify-center items-center">
                    <View className="items-center">
                        <Image
                            source={title}
                            style={styles.title}
                        />
                    </View>
		    <View 
			className="bg-neutral-800/90 backdrop-blur-md rounded-xl p-6 shadow-lg"
				   style={{ minHeight: 200, justifyContent: "center" }}
		    >
			<TouchableOpacity
			    className="w-60 bg-deepblue p-5 rounded-lg mb-2"
			    onPress={() => {
				handleAdmin();
			    }}
			    activeOpacity={0.6}
			>
			    <Text className="text-white text-center">ADMIN</Text>
			</TouchableOpacity>
			<TouchableOpacity
			    className="bg-deepblue p-5 rounded-lg"
			    onPress={() => {
				handleMember();
			    }}
			    activeOpacity={0.6}
			>
			    <Text className="text-white text-center">MEMBER</Text>
			</TouchableOpacity>
		    </View>
		</View>
	    </ImageBackground>
	</SafeAreaView>
    );
};

export default App;

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        width: 200,
        height: 200,
        justifyContent: "center",
    }
});
