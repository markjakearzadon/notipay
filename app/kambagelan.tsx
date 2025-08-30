import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const kambagelan = () => {
  const router = useRouter();
  return (
    <View className="h-screen w-screen bg-white flex-1 justify-center items-center p-4">
      <Text className="text-black text-lg mb-8">
        who the hell even bothers with this shit bro nobody reads this type of
        shit
      </Text>
      <TouchableOpacity onPress={() => router.push("/")}>
        <Text className="text-blue-500 text-center text-lg font-semibold">
          Get Your Ass Outta Here 👺
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default kambagelan;
